#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
StudioMenu — Criação de Catálogo via Admin API (produção)
=============================================================================
Recebe os dados de uma cliente (JSON) e cria o catálogo dela em produção,
chamando as MESMAS rotas de admin que o painel web (/admin/criar-com-ia)
usa — não escreve direto no banco. Isso é proposital: toda a regra de
negócio (geração de slug, preset de nicho, cálculo de duração agendável,
código curto do link do app, etc.) continua vivendo só no código TypeScript
do app, então este script nunca fica desatualizado por conta própria.

Fluxo:
1. Login no admin (POST /api/admin/login) usando ADMIN_PASSWORD do .env.
2. Cria o catálogo (POST /api/admin/finalize-catalog) — nome, WhatsApp,
   Instagram, nicho, modelo visual, procedimentos e foto de capa.
3. Aprova o catálogo (PATCH /api/admin/catalog-actions, status=aprovado) —
   equivalente a clicar em "Aprovar & Entregar" no painel.
4. Busca o catálogo recém-criado (GET /api/admin/catalogs-list) pra pegar o
   link curto do app (gerado sob demanda nessa mesma chamada).
5. Monta e imprime os links oficiais e as 2 mensagens prontas de WhatsApp
   (entrega do catálogo + apresentação do app), no mesmo formato que o
   painel admin já usa.
=============================================================================
"""

import sys
import os
import re
import json
import mimetypes
import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Domínio público (usado pra montar os links que vão pra cliente — igual ao
# que o próprio app gera, ver src/lib/public-url.ts).
PUBLIC_BASE_URL = os.environ.get("STUDIOMENU_BASE_URL", "https://studiomenu.art").rstrip("/")

# Host real das rotas de API. O domínio nu (`studiomenu.art`) faz redirect
# 308 pra `www.studiomenu.art` no nível da Vercel — urllib não repete POST
# em 308 automaticamente, então as chamadas de admin precisam ir direto no
# host final pra não perder o corpo da requisição no meio do redirect.
API_BASE_URL = os.environ.get("STUDIOMENU_API_BASE_URL", "https://www.studiomenu.art").rstrip("/")

VALID_NICHES = {"lash", "nail", "estetica", "studio"}
VALID_LAYOUTS = {"mosaico", "classico"}
VALID_THEMES = {"rose", "luxury"}
VALID_OFFER_TIERS = {"basico", "plus"}


# --------------------------------------------------------------------------
# Infraestrutura HTTP (stdlib puro, sem dependências externas — mesma
# convenção do script anterior). Usa um CookieJar pra manter a sessão do
# admin entre as chamadas (login → finalize-catalog → catalog-actions →
# catalogs-list), do mesmo jeito que o navegador faria.
# --------------------------------------------------------------------------
_cookie_jar = http.cookiejar.CookieJar()
_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_cookie_jar))


def _read_admin_password() -> str:
    """Lê ADMIN_PASSWORD da variável de ambiente ou do .env local (o mesmo
    .env do projeto já aponta pra produção — ver docs/atual/ESTADO_ATUAL.md).
    Nunca imprime o valor."""
    env_val = os.environ.get("ADMIN_PASSWORD")
    if env_val:
        return env_val

    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                m = re.match(r"^\s*ADMIN_PASSWORD\s*=\s*(.+?)\s*$", line)
                if m:
                    return m.group(1).strip().strip('"').strip("'")

    raise RuntimeError(
        "ADMIN_PASSWORD não encontrada (defina a variável de ambiente ou tenha um .env na raiz do projeto)."
    )


def _request_json(path: str, method: str = "GET", payload=None):
    url = f"{API_BASE_URL}{path}"
    body_bytes = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        body_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=body_bytes, headers=headers, method=method)
    try:
        with _opener.open(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="ignore")
        try:
            return json.loads(raw)
        except Exception:
            raise RuntimeError(f"HTTP {e.code} em {url}: {raw}")


def _encode_multipart(fields: dict, files: dict):
    """Monta um corpo multipart/form-data manualmente (sem dependências
    externas). `fields`: {nome: valor_str}. `files`: {nome: (filename, bytes, content_type)}."""
    boundary = "----StudioMenuBoundary" + datetime.now().strftime("%Y%m%d%H%M%S%f")
    parts = []

    for name, value in fields.items():
        if value is None:
            continue
        parts.append(f"--{boundary}\r\n".encode("utf-8"))
        parts.append(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"))
        parts.append(f"{value}\r\n".encode("utf-8"))

    for name, (filename, file_bytes, content_type) in files.items():
        parts.append(f"--{boundary}\r\n".encode("utf-8"))
        parts.append(
            f'Content-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'.encode("utf-8")
        )
        parts.append(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
        parts.append(file_bytes)
        parts.append(b"\r\n")

    parts.append(f"--{boundary}--\r\n".encode("utf-8"))
    body = b"".join(parts)
    return body, f"multipart/form-data; boundary={boundary}"


def admin_login(password: str):
    res = _request_json("/api/admin/login", method="POST", payload={"password": password})
    if not res.get("success"):
        raise RuntimeError(f"Falha no login do admin: {res.get('message', 'motivo desconhecido')}")


def resolve_cover_bytes(client_data: dict):
    """Retorna (filename, bytes, content_type) pra foto de capa, a partir de
    um arquivo local (`cover_image_path`) ou de uma URL já pronta
    (`cover_image_url`, ex: extraída de outro site durante a conversa).
    Se nenhum dos dois vier, o catálogo nasce com a capa padrão do modelo
    (comportamento normal do finalize-catalog sem `coverFile`)."""
    local_path = client_data.get("cover_image_path")
    cover_url = client_data.get("cover_image_url")

    if local_path:
        if not os.path.exists(local_path):
            print(f"⚠️  Aviso: cover_image_path não encontrado ({local_path}). Seguindo com a capa padrão do modelo.")
            return None
        filename = os.path.basename(local_path)
        content_type = mimetypes.guess_type(local_path)[0] or "image/jpeg"
        with open(local_path, "rb") as f:
            return filename, f.read(), content_type

    if cover_url:
        try:
            req = urllib.request.Request(cover_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
                content_type = resp.headers.get_content_type() or "image/jpeg"
            filename = os.path.basename(urllib.parse.urlparse(cover_url).path) or "capa.jpg"
            return filename, data, content_type
        except Exception as e:
            print(f"⚠️  Aviso: não consegui baixar cover_image_url ({e}). Seguindo com a capa padrão do modelo.")
            return None

    return None


def build_procedures_payload(raw_services: list) -> list:
    """Converte os serviços recebidos (formato livre vindo da conversa) pro
    formato ProcedureItem esperado pelo finalize-catalog. Duração em minutos
    e fallback de preço/imagem ficam por conta do servidor (buildServicesPayload
    em src/lib/order-payload.ts) — aqui só normaliza o que a IA da conversa
    já coletou."""
    procedures = []
    for idx, svc in enumerate(raw_services):
        title = (svc.get("title") or svc.get("name") or "").strip()
        if not title:
            continue
        procedures.append(
            {
                "id": f"chat-{int(datetime.now().timestamp())}-{idx}",
                "title": title,
                "description": svc.get("description") or "",
                "price": (svc.get("price") or "Sob Consulta"),
                "duration": svc.get("duration") or "",
                "duration_minutes": svc.get("duration_minutes"),
                "category": svc.get("category") or "Geral",
                "image_url": svc.get("image_url") or "",
                "badge": svc.get("badge") or "",
                "is_highlight": bool(svc.get("is_highlight", False)),
            }
        )
    return procedures


def finalize_catalog(client_data: dict) -> dict:
    client_name = (client_data.get("client_name") or "").strip()
    whatsapp = (client_data.get("whatsapp") or "").strip()
    if not client_name:
        raise ValueError("client_name é obrigatório.")
    if not whatsapp:
        raise ValueError("whatsapp é obrigatório.")

    niche = client_data.get("niche", "lash")
    if niche not in VALID_NICHES:
        raise ValueError(f"niche inválido: {niche!r}. Use um de: {sorted(VALID_NICHES)}")

    layout_model = client_data.get("layout_model", "mosaico")
    if layout_model not in VALID_LAYOUTS:
        raise ValueError(f"layout_model inválido: {layout_model!r}. Use um de: {sorted(VALID_LAYOUTS)}")

    theme_variant = client_data.get("theme_variant", "rose")
    if theme_variant not in VALID_THEMES:
        raise ValueError(f"theme_variant inválido: {theme_variant!r}. Use um de: {sorted(VALID_THEMES)}")

    first_offer_tier = client_data.get("first_offer_tier", "basico")
    if first_offer_tier not in VALID_OFFER_TIERS:
        raise ValueError(f"first_offer_tier inválido: {first_offer_tier!r}. Use 'basico' ou 'plus'.")

    procedures = build_procedures_payload(client_data.get("services", []))

    fields = {
        "clientName": client_name,
        "whatsappNumber": whatsapp,
        "instagramHandle": (client_data.get("instagram") or "").replace("@", "").strip(),
        "niche": niche,
        "layoutModel": layout_model,
        "themeVariant": theme_variant,
        "procedures": json.dumps(procedures, ensure_ascii=False),
        "firstOfferTier": first_offer_tier,
        "aiAdaptCover": "1" if client_data.get("ai_adapt_cover") else "0",
    }

    files = {}
    cover = resolve_cover_bytes(client_data)
    if cover:
        filename, file_bytes, content_type = cover
        files["coverFile"] = (filename, file_bytes, content_type)

    body, content_type_header = _encode_multipart(fields, files)
    req = urllib.request.Request(
        f"{API_BASE_URL}/api/admin/finalize-catalog",
        data=body,
        headers={"Content-Type": content_type_header, "Accept": "application/json"},
        method="POST",
    )
    with _opener.open(req, timeout=60) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    if not result.get("success"):
        raise RuntimeError(f"Erro ao criar o catálogo: {result.get('message', 'motivo desconhecido')}")

    return result


def approve_and_fetch(slug: str) -> dict:
    """Aprova o catálogo (equivalente a 'Aprovar & Entregar' no painel) e
    devolve a linha completa da listagem (já com app_short_code preenchido
    pela própria chamada, que faz o backfill sob demanda)."""
    catalogs = _request_json("/api/admin/catalogs-list", method="GET")
    if not catalogs.get("success"):
        raise RuntimeError(f"Erro ao buscar catálogos: {catalogs.get('message')}")

    item = next((c for c in catalogs.get("catalogs", []) if c.get("slug") == slug), None)
    if not item:
        raise RuntimeError(f"Catálogo criado (slug={slug}) mas não encontrado na listagem do admin.")

    patch_res = _request_json(
        "/api/admin/catalog-actions",
        method="PATCH",
        payload={"id": item["id"], "status": "aprovado"},
    )
    if not patch_res.get("success"):
        print(f"⚠️  Aviso: catálogo criado, mas falhou ao aprovar automaticamente ({patch_res.get('message')}).")

    return item


def normalize_whatsapp_br(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if not digits:
        return ""
    return digits if len(digits) > 11 else f"55{digits}"


def build_links(slug: str, edit_token: str, app_short_code: str) -> dict:
    domain = PUBLIC_BASE_URL.split("//", 1)[-1]
    official = f"https://{slug}.{domain}"
    edit = f"{official}?edit={edit_token}"
    app = (
        f"https://{domain}/a/{app_short_code}"
        if app_short_code
        else f"{official}/api/professional/login?slug={slug}&token={edit_token}"
    )
    return {"official": official, "edit": edit, "app": app}


def build_whatsapp_messages(client_name: str, first_offer_tier: str, links: dict) -> dict:
    first_name = client_name.split()[0] if client_name.split() else client_name

    if first_offer_tier == "plus":
        delivery_message = (
            f"Olá, {first_name}! ✨\n\n"
            f"Seu catálogo digital StudioMenu está pronto — e com ele você já pode liberar o *agendamento automático*: "
            f"suas clientes escolhem o dia e o horário sozinhas, sem trocar mensagem com você. 📅\n\n"
            f"🔗 *Seu Link Exclusivo:*\n👉 {links['official']}\n\n"
            f"📌 *O que fazer agora:*\n"
            f"1. Abra o link no seu celular e confira seu catálogo completo.\n"
            f"2. Coloque este link na bio do seu Instagram e no seu perfil do WhatsApp Business.\n"
            f"3. Pra ativar o agendamento automático, é só assinar — te mando o acesso em seguida.\n\n"
            f"Qualquer dúvida ou ajuste que precisar, nossa equipe está à sua inteira disposição. "
            f"Parabéns pelo seu novo posicionamento! 💖✨"
        )
    else:
        delivery_message = (
            f"Olá, {first_name}! ✨\n\n"
            f"Seu catálogo digital oficial StudioMenu está pronto, calibrado e no ar! 🚀\n\n"
            f"🔗 *Seu Link Exclusivo:*\n👉 {links['official']}\n\n"
            f"📌 *O que fazer agora:*\n"
            f"1. Abra o link no seu celular e confira seu catálogo completo.\n"
            f"2. Coloque este link na bio do seu Instagram e no seu perfil do WhatsApp Business.\n"
            f"3. Comece a enviar para suas clientes no momento do agendamento!\n\n"
            f"Qualquer dúvida ou ajuste que precisar, nossa equipe está à sua inteira disposição. "
            f"Parabéns pelo seu novo posicionamento! 💖✨"
        )

    app_message = (
        f"Oi, {first_name}! ✨\n\n"
        f"Agora quero te apresentar o *app do seu StudioMenu* 📱\n\n"
        f"É por ele que você:\n"
        f"• vê e compartilha o link do seu catálogo\n"
        f"• edita fotos, serviços e preços quando quiser, sem depender de ninguém\n"
        f"• assina o plano pra manter tudo no ar\n\n"
        f"👉 *Seu acesso ao app:*\n{links['app']}\n\n"
        f"📌 *Dicas:*\n"
        f"1. Abra pelo celular. Ao abrir, aparecem umas dicas rápidas te mostrando cada parte.\n"
        f"2. Esse link é só seu e já te deixa logada, então não compartilhe com ninguém.\n"
        f"3. Dá pra instalar na tela inicial do celular, como um app de verdade.\n\n"
        f"Qualquer dúvida é só me chamar por aqui! 💖"
    )

    return {"delivery_message": delivery_message, "app_message": app_message}


def build_catalog(client_data: dict) -> dict:
    password = _read_admin_password()
    admin_login(password)

    created = finalize_catalog(client_data)
    slug = created["slug"]
    edit_token = created["editToken"]

    item = approve_and_fetch(slug)
    app_short_code = item.get("app_short_code")

    links = build_links(slug, edit_token, app_short_code)
    messages = build_whatsapp_messages(client_data.get("client_name", ""), client_data.get("first_offer_tier", "basico"), links)

    clean_phone = normalize_whatsapp_br(client_data.get("whatsapp", ""))
    delivery_wa_url = f"https://api.whatsapp.com/send?phone={clean_phone}&text={urllib.parse.quote(messages['delivery_message'])}"
    app_wa_url = f"https://api.whatsapp.com/send?phone={clean_phone}&text={urllib.parse.quote(messages['app_message'])}"

    return {
        "success": True,
        "order_id": item["id"],
        "slug": slug,
        "client_name": client_data.get("client_name", ""),
        "niche": client_data.get("niche", "lash"),
        "model": f"{client_data.get('layout_model', 'mosaico')}-{client_data.get('theme_variant', 'rose')}",
        "services_count": len(client_data.get("services", [])),
        "links": links,
        "admin_panel_url": f"{PUBLIC_BASE_URL}/admin/catalogos",
        "delivery_whatsapp_url": delivery_wa_url,
        "app_whatsapp_url": app_wa_url,
        "delivery_message": messages["delivery_message"],
        "app_message": messages["app_message"],
    }


def main():
    if len(sys.argv) < 2:
        print("Uso: python criar_catalogo.py <caminho_json_ou_string_json>")
        sys.exit(1)

    input_arg = sys.argv[1]
    if os.path.exists(input_arg):
        with open(input_arg, "rb") as f:
            data = json.loads(f.read().decode("utf-8", errors="replace"))
    else:
        try:
            data = json.loads(input_arg)
        except Exception as e:
            print(f"Erro ao parsear JSON: {e}")
            sys.exit(1)

    try:
        res = build_catalog(data)
    except Exception as e:
        print(f"\n❌ Erro ao criar o catálogo: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("🎉 CATÁLOGO CRIADO E APROVADO COM SUCESSO!")
    print("=" * 60)
    print(f"Cliente: {res['client_name']}  |  Nicho: {res['niche']}  |  Modelo: {res['model']}")
    print(f"Serviços cadastrados: {res['services_count']}")
    print(f"\n🌐 Link Oficial do Catálogo: {res['links']['official']}")
    print(f"🔗 Link Mágico de Edição:    {res['links']['edit']}")
    print(f"📱 Link do App:              {res['links']['app']}")
    print(f"🛠️  Painel Admin:             {res['admin_panel_url']}")
    print("\n--- Mensagem 1: Entrega do Catálogo (clique pra abrir no WhatsApp) ---")
    print(res["delivery_whatsapp_url"])
    print("\n--- Mensagem 2: Apresentação do App (clique pra abrir no WhatsApp) ---")
    print(res["app_whatsapp_url"])
    print("\n" + "=" * 60)
    print(json.dumps(res, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
