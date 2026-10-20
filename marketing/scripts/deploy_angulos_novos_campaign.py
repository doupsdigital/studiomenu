import urllib.request
import urllib.parse
import ssl
import json
import time

TOKEN = 'EAAWMnrVYZAnsBS4qPZA73Qbfu2UO71mduFkZBROWaHbXuEyQZAVLWsZCl9YZBEWOTi86Xd83N9r6epF4ThLVQG1ZADXgaDUoqvWLNcyuvZAsZAlGofNEexHTa2bL8INX1X8k8dJ9aUrCaSbjN0219OBZBZCQjkaH7fTyW93EJQO2w7DAYZCufurXlsqkjSEretqYhCCigeXpYgFWZBuf2vUuFnb0ZCEzKSj1HFVvGq48O7ys70YOpmt12q2cE0C4jiDOXpho09z7CqSNO2EAQOnYCxFG87UhIrgiyr5FRPLQ1VLgZDZD'
ACCOUNT_ID = 'act_1626088674941828'
PAGE_ID = '1184875188046307'
PIXEL_ID = '1042165951490026'

# Início amanhã às 05:00 (horário de Brasília)
START_TIME = '2026-10-20T05:00:00-0300'

ctx = ssl._create_unverified_context()

HASHES = {
    'lash_angulo1': '3185aa42c595aaf3459c2851f268588a',
    'lash_angulo2': '9c5cede490596628f35f2c380112c77b',
    'nail_angulo1': '4e70b543c7c38553948d8adb25d5dacd',
    'nail_angulo2': '054d2df98679af7e329184abb79847a4'
}

def meta_api(endpoint, payload=None, method='POST'):
    url = f"https://graph.facebook.com/v20.0/{endpoint}"
    if payload is None:
        payload = {}
    payload['access_token'] = TOKEN
    
    if method == 'GET':
        qs = urllib.parse.urlencode(payload)
        req = urllib.request.Request(f"{url}?{qs}", method='GET')
    else:
        encoded = urllib.parse.urlencode(payload).encode('utf-8')
        req = urllib.request.Request(url, data=encoded, method=method)

    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err = e.read().decode('utf-8')
        print(f"❌ Error {e.code} on {endpoint}: {err}")
        raise Exception(err)

def main():
    print("🚀 Iniciando criação da Campanha StudioMenu - Ângulos Novos (Stories/Reels 9:16)...")

    # 1. Criação da Campanha
    campaign_payload = {
        'name': '[STUDIOMENU] Teste Novos Criativos — 9:16 (Stories/Reels)',
        'objective': 'OUTCOME_SALES',
        'status': 'ACTIVE',
        'is_adset_budget_sharing_enabled': False,
        'special_ad_categories': json.dumps([])
    }
    print("\n📦 Criando Campanha...")
    camp_res = meta_api(f"{ACCOUNT_ID}/campaigns", campaign_payload)
    campaign_id = camp_res['id']
    print(f"✅ Campanha Criada com Sucesso! ID: {campaign_id}")

    # 2. Configurações de Targeting (Sem PAC — 9:16 Manual Placements)
    lash_targeting = {
        'age_min': 20,
        'age_max': 42,
        'genders': [2], # Mulheres
        'geo_locations': {
            'countries': ['BR'],
            'location_types': ['home', 'recent']
        },
        'targeting_automation': {'advantage_audience': 0},
        'publisher_platforms': ['instagram', 'facebook'],
        'instagram_positions': ['story', 'reels'],
        'facebook_positions': ['story', 'facebook_reels'],
        'device_platforms': ['mobile'],
        'flexible_spec': [{
            'interests': [
                {'id': '6003088846792', 'name': 'Salões de beleza (cosméticos)'},
                {'id': '6003335445971', 'name': 'Extensão de cílios (cosméticos)'}
            ]
        }]
    }

    nail_targeting = {
        'age_min': 20,
        'age_max': 42,
        'genders': [2], # Mulheres
        'geo_locations': {
            'countries': ['BR'],
            'location_types': ['home', 'recent']
        },
        'targeting_automation': {'advantage_audience': 0},
        'publisher_platforms': ['instagram', 'facebook'],
        'instagram_positions': ['story', 'reels'],
        'facebook_positions': ['story', 'facebook_reels'],
        'device_platforms': ['mobile'],
        'flexible_spec': [{
            'interests': [
                {'id': '6003088846792', 'name': 'Salões de beleza (cosméticos)'},
                {'id': '6003343444656', 'name': 'Nails Art'},
                {'id': '6003988602106', 'name': 'Manicure (cosméticos)'},
                {'id': '6017501817751', 'name': 'unhas decoradas (cosméticos)'}
            ]
        }]
    }

    adsets_data = [
        {
            'key': 'lash',
            'name': '[STUDIOMENU] Lash — 9:16 (Stories/Reels) — R$ 20/dia',
            'budget': '2000',
            'targeting': lash_targeting,
            'ads': [
                {
                    'name': 'Ad 01 — Lash (Ângulo 1 - Perde Clientes)',
                    'title': 'Não é PDF nem Canva: é um site de verdade ✨',
                    'body': 'Você ainda perde clientes mandando tabela de preços em PDF ou fotos soltas no WhatsApp?\n\nTenha o seu próprio Menu Digital interativo no link da bio. Suas fotos, técnicas, valores e agendamento direto com você — rápido, luxuoso e sem travar o celular da cliente.\n\n👉 Toque em "Saiba Mais" e veja uma demonstração ao vivo agora mesmo!',
                    'hash': HASHES['lash_angulo1'],
                    'url': 'https://www.studiomenu.art/?nicho=lash&utm_source=meta&utm_medium=stories_reels&utm_campaign=angulos_novos&utm_content=lash_angulo1'
                },
                {
                    'name': 'Ad 02 — Lash (Ângulo 2 - Studio Incrível)',
                    'title': 'Seu Studio incrível merece mais que PDF solto ✨',
                    'body': 'Você construiu um Studio incrível. Mas ainda manda tabela de preços em PDF ou fotos soltas no WhatsApp?\n\nValorize seus procedimentos de Lash com um Menu Digital exclusivo e profissional. Suas clientes navegam, escolhem e agendam direto no seu WhatsApp.\n\n👉 Toque em "Saiba Mais" e teste a demonstração ao vivo!',
                    'hash': HASHES['lash_angulo2'],
                    'url': 'https://www.studiomenu.art/?nicho=lash&utm_source=meta&utm_medium=stories_reels&utm_campaign=angulos_novos&utm_content=lash_angulo2'
                }
            ]
        },
        {
            'key': 'nail',
            'name': '[STUDIOMENU] Nail — 9:16 (Stories/Reels) — R$ 20/dia',
            'budget': '2000',
            'targeting': nail_targeting,
            'ads': [
                {
                    'name': 'Ad 03 — Nail (Ângulo 1 - Perde Clientes)',
                    'title': 'Não é PDF nem Canva: é um site de verdade ✨',
                    'body': 'Você ainda perde clientes mandando tabela de preços em PDF ou fotos soltas no WhatsApp?\n\nApresente suas técnicas de alongamento em gel, banho de gel e nail art em um Menu Digital interativo impecável na bio do seu Instagram.\n\n👉 Toque em "Saiba Mais" e veja como fica no celular!',
                    'hash': HASHES['nail_angulo1'],
                    'url': 'https://www.studiomenu.art/?nicho=nail&utm_source=meta&utm_medium=stories_reels&utm_campaign=angulos_novos&utm_content=nail_angulo1'
                },
                {
                    'name': 'Ad 04 — Nail (Ângulo 2 - Studio Incrível)',
                    'title': 'Seu Studio incrível merece mais que PDF solto ✨',
                    'body': 'Você construiu um Studio incrível. Mas ainda manda tabela de preços em PDF ou fotos soltas no WhatsApp?\n\nTransforme a apresentação dos seus trabalhos de unhas com um Menu Digital interativo e luxuoso. Fotos ampliadas, valores claros e agendamento direto.\n\n👉 Toque em "Saiba Mais" e teste ao vivo agora mesmo!',
                    'hash': HASHES['nail_angulo2'],
                    'url': 'https://www.studiomenu.art/?nicho=nail&utm_source=meta&utm_medium=stories_reels&utm_campaign=angulos_novos&utm_content=nail_angulo2'
                }
            ]
        }
    ]

    deployed = []

    for adset_cfg in adsets_data:
        print(f"\n📂 Criando Conjunto de Anúncios: {adset_cfg['name']}...")
        adset_payload = {
            'name': adset_cfg['name'],
            'campaign_id': campaign_id,
            'daily_budget': adset_cfg['budget'],
            'billing_event': 'IMPRESSIONS',
            'optimization_goal': 'OFFSITE_CONVERSIONS',
            'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
            'destination_type': 'WEBSITE',
            'promoted_object': json.dumps({'pixel_id': PIXEL_ID, 'custom_event_type': 'PURCHASE'}),
            'targeting': json.dumps(adset_cfg['targeting']),
            'start_time': START_TIME,
            'status': 'ACTIVE'
        }
        adset_res = meta_api(f"{ACCOUNT_ID}/adsets", adset_payload)
        adset_id = adset_res['id']
        print(f"✅ Conjunto Criado! ID: {adset_id}")

        for ad_cfg in adset_cfg['ads']:
            print(f"  🎨 Criando Criativo para {ad_cfg['name']}...")
            creative_payload = {
                'name': f"Criativo - {ad_cfg['name']}",
                'object_story_spec': json.dumps({
                    'page_id': PAGE_ID,
                    'link_data': {
                        'link': ad_cfg['url'],
                        'message': ad_cfg['body'],
                        'name': ad_cfg['title'],
                        'image_hash': ad_cfg['hash'],
                        'call_to_action': {'type': 'LEARN_MORE'}
                    }
                })
            }
            c_res = meta_api(f"{ACCOUNT_ID}/adcreatives", creative_payload)
            creative_id = c_res['id']
            print(f"  ✅ Criativo Criado! ID: {creative_id}")

            print(f"  📢 Criando Anúncio: {ad_cfg['name']}...")
            ad_payload = {
                'name': ad_cfg['name'],
                'adset_id': adset_id,
                'creative': json.dumps({'creative_id': creative_id}),
                'status': 'ACTIVE'
            }
            ad_res = meta_api(f"{ACCOUNT_ID}/ads", ad_payload)
            ad_id = ad_res['id']
            print(f"  ✅ Anúncio Criado e Ativado! ID: {ad_id}")
            deployed.append({
                'adset': adset_cfg['name'],
                'ad_name': ad_cfg['name'],
                'ad_id': ad_id,
                'creative_id': creative_id
            })
            time.sleep(1)

    print("\n🎉 ========================================================")
    print("🎉 DEPLOY CONCLUÍDO COM SUCESSO NO META ADS!")
    print(f"🎉 Campanha ID: {campaign_id}")
    print(f"🎉 Início Agendado: {START_TIME} (Amanhã 05:00)")
    print(f"🎉 Orçamento Total: R$ 40,00/dia (R$ 20 Lash + R$ 20 Nail)")
    print("🎉 ========================================================")

if __name__ == '__main__':
    main()
