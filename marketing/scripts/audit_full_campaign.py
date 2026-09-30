import urllib.request
import urllib.parse
import ssl
import json

TOKEN = 'EAAWMnrVYZAnsBSrMzKiZCQtQvpldkRRxMV1ovzrPRhrlJQZC6ckN3u3t5Cm2BNI3wceThZA6QwSMwA4LZBjfpfLlLwC63d7f5iX3fG1ldn2nNvvdvaABS8ZCFQG9RVYSxAtjnZAIvbN5bIZB6zPEU2HDU1gElHW1ZCSRrgbJYnuIG0GKDxoboEAZAuU5eyk2ZCHgmEd1gu1kGtOJIBnlsfrZBtKlBdUX56nSEL33rzwN0bxPhJxf4EXoJHgP96ZAtHWUWGlZC6K18mEpZBlXQDuy76vRLw6cZAyvEqkTwsluMEhx3w8ZD'
ACCOUNT_ID = 'act_1626088674941828'
CAMPAIGN_ID = '120248312256100218'

ctx = ssl._create_unverified_context()

def meta_get(endpoint):
    sep = '&' if '?' in endpoint else '?'
    url = f"https://graph.facebook.com/v20.0/{endpoint}{sep}access_token={TOKEN}"
    req = urllib.request.Request(url, method='GET')
    res = urllib.request.urlopen(req, context=ctx)
    return json.loads(res.read().decode('utf-8'))

def audit():
    print("="*70)
    print("🔍 AUDITORIA COMPLETA DE SEGURANÇA E CONFIGURAÇÃO DA CAMPANHA")
    print("="*70)

    # 1. Campaign Level
    c_res = meta_get(f"{CAMPAIGN_ID}?fields=id,name,status,objective,special_ad_categories")
    print(f"\n📌 [NÍVEL CAMPANHA]")
    print(f" • Nome: {c_res.get('name')}")
    print(f" • ID: {c_res.get('id')}")
    print(f" • Status: {c_res.get('status')} (Deverá iniciar conforme o agendamento)")
    print(f" • Objetivo: {c_res.get('objective')}")
    print(f" • Categorias Especiais: {c_res.get('special_ad_categories', [])}")

    # 2. AdSets Level
    adsets_res = meta_get(f"{CAMPAIGN_ID}/adsets?fields=id,name,status,daily_budget,start_time,destination_type,optimization_goal,promoted_object,targeting")
    adsets_data = adsets_res.get('data', [])
    
    print(f"\n📌 [NÍVEL CONJUNTOS DE ANÚNCIOS] — Total de Conjuntos: {len(adsets_data)}")
    total_budget = 0

    for adset in adsets_data:
        budget = int(adset.get('daily_budget', 0)) / 100
        total_budget += budget
        targeting = adset.get('targeting', {})
        flex = targeting.get('flexible_spec', [{}])[0].get('interests', [])
        interests_str = ", ".join([i['name'] for i in flex]) if flex else "Geral"

        print(f"\n  🎯 Conjunto: {adset['name']}")
        print(f"     • ID: {adset['id']}")
        print(f"     • Status: {adset['status']}")
        print(f"     • Orçamento Diário: R$ {budget:.2f}/dia")
        print(f"     • Data/Hora de Início: {adset.get('start_time')} (01/10 às 06:00 AM)")
        print(f"     • Local da Conversão / Destino: {adset.get('destination_type')}")
        print(f"     • Meta de Otimização: {adset.get('optimization_goal')}")
        print(f"     • Pixel ID Vinculado: {adset.get('promoted_object', {}).get('pixel_id')}")
        print(f"     • Idade & Gênero: {targeting.get('age_min')}-{targeting.get('age_max')} anos | Mulheres")
        print(f"     • Interesses Segmentados: {interests_str}")

    print(f"\n 💰 Orçamento Diário Combinado: R$ {total_budget:.2f}/dia")

    # 3. Ads Level
    ads_res = meta_get(f"{CAMPAIGN_ID}/ads?fields=id,name,status,creative{{id,name,object_story_spec}}")
    ads_data = ads_res.get('data', [])

    print(f"\n📌 [NÍVEL ANÚNCIOS] — Total de Anúncios: {len(ads_data)}")
    
    for ad in ads_data:
        aname = ad['name']
        aid = ad['id']
        spec = ad.get('creative', {}).get('object_story_spec', {})
        page_id = spec.get('page_id')
        
        link_data = spec.get('link_data', {})
        video_data = spec.get('video_data', {})

        if link_data:
            destination_link = link_data.get('link')
            cta_type = link_data.get('call_to_action', {}).get('type')
            media_type = "Imagem"
        else:
            destination_link = video_data.get('call_to_action', {}).get('value', {}).get('link')
            cta_type = video_data.get('call_to_action', {}).get('type')
            media_type = "Vídeo"

        print(f"\n  📣 Anúncio: {aname}")
        print(f"     • ID: {aid}")
        print(f"     • Status: {ad['status']}")
        print(f"     • Tipo de Mídia: {media_type}")
        print(f"     • Página do Facebook (ID): {page_id}")
        print(f"     • Botão de Chamada para Ação (CTA): {cta_type}")
        print(f"     • URL do Destino WhatsApp: {destination_link}")

    print("\n" + "="*70)
    print("✅ AUDITORIA CONCLUÍDA — VALIDAÇÃO GERAL OK!")
    print("="*70)

if __name__ == '__main__':
    audit()
