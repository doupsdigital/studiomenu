import urllib.request
import urllib.parse
import ssl
import json
import os
import sys
import time

TOKEN = 'EAAWMnrVYZAnsBSrMzKiZCQtQvpldkRRxMV1ovzrPRhrlJQZC6ckN3u3t5Cm2BNI3wceThZA6QwSMwA4LZBjfpfLlLwC63d7f5iX3fG1ldn2nNvvdvaABS8ZCFQG9RVYSxAtjnZAIvbN5bIZB6zPEU2HDU1gElHW1ZCSRrgbJYnuIG0GKDxoboEAZAuU5eyk2ZCHgmEd1gu1kGtOJIBnlsfrZBtKlBdUX56nSEL33rzwN0bxPhJxf4EXoJHgP96ZAtHWUWGlZC6K18mEpZBlXQDuy76vRLw6cZAyvEqkTwsluMEhx3w8ZD'
ACCOUNT_ID = 'act_1626088674941828'
PAGE_ID = '1184875188046307'
PIXEL_ID = '1042165951490026'
WHATSAPP_NUMBER = '5562991083435'

START_TIME = '2026-10-01T06:00:00-0300'

ctx = ssl._create_unverified_context()

def meta_post(endpoint, payload, retries=3):
    url = f"https://graph.facebook.com/v20.0/{endpoint}"
    payload['access_token'] = TOKEN
    data = urllib.parse.urlencode(payload).encode('utf-8')
    for attempt in range(1, retries + 1):
        req = urllib.request.Request(url, data=data, method='POST')
        try:
            res = urllib.request.urlopen(req, context=ctx)
            return json.loads(res.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            err_content = e.read().decode('utf-8')
            if attempt < retries:
                print(f"⚠️ Retry {attempt}/{retries} on POST {endpoint}...")
                time.sleep(2)
            else:
                print(f"❌ Error on POST {endpoint}: {err_content}")
                raise Exception(err_content)

def meta_get(endpoint):
    sep = '&' if '?' in endpoint else '?'
    url = f"https://graph.facebook.com/v20.0/{endpoint}{sep}access_token={TOKEN}"
    req = urllib.request.Request(url, method='GET')
    res = urllib.request.urlopen(req, context=ctx)
    return json.loads(res.read().decode('utf-8'))

def main():
    print("🚀 Resuming Official StudioMenu Meta Ads Campaign Deployment...")
    
    lash_img_hash = 'bd24b1f27514b24416d1041e628e51cc'
    nail_img_hash = '2dbf038efd45f56ef9adddec57fa381a'
    lash_video_id = '1799748824690062'
    nail_video_id = '2252107502247176'

    campaign_id = '120248312256100218'
    print(f"✅ Using Official Campaign ID: {campaign_id}")

    existing_adsets_res = meta_get(f"{campaign_id}/adsets?fields=id,name")
    existing_adsets_map = {a['name']: a['id'] for a in existing_adsets_res.get('data', [])}

    lash_targeting = {
        'age_min': 20,
        'age_max': 42,
        'genders': [2],
        'geo_locations': {
            'countries': ['BR'],
            'location_types': ['home', 'recent']
        },
        'targeting_automation': {'advantage_audience': 0},
        'flexible_spec': [{
            'interests': [
                {'id': '6003335445971', 'name': 'Extensão de cílios (cosméticos)'},
                {'id': '6003088846792', 'name': 'Salões de beleza (cosméticos)'}
            ]
        }]
    }

    nail_targeting = {
        'age_min': 20,
        'age_max': 42,
        'genders': [2],
        'geo_locations': {
            'countries': ['BR'],
            'location_types': ['home', 'recent']
        },
        'targeting_automation': {'advantage_audience': 0},
        'flexible_spec': [{
            'interests': [
                {'id': '6003988602106', 'name': 'Manicure (cosméticos)'},
                {'id': '6017501817751', 'name': 'unhas decoradas (cosméticos)'},
                {'id': '6003343444656', 'name': 'Nails Art'},
                {'id': '6003088846792', 'name': 'Salões de beleza (cosméticos)'}
            ]
        }]
    }

    adsets_config = [
        {
            'name': '[STUDIOMENU] AdSet 01 — Lash (Vídeo)',
            'budget': '1500',
            'targeting': lash_targeting,
            'type': 'video',
            'video_id': lash_video_id,
            'image_hash': lash_img_hash,
            'ad_name': 'Ad 01 - StudioMenu Lash (Vídeo)',
            'message': 'Transforme a apresentação dos seus procedimentos de lash em um catálogo digital luxuoso e impressione suas clientes!',
            'greeting': 'Olá! Vi o vídeo do StudioMenu para Lash e quero meu catálogo!'
        },
        {
            'name': '[STUDIOMENU] AdSet 02 — Lash (Imagem)',
            'budget': '1000',
            'targeting': lash_targeting,
            'type': 'image',
            'image_hash': lash_img_hash,
            'ad_name': 'Ad 02 - StudioMenu Lash (Imagem)',
            'message': 'Eleve a imagem do seu estúdio com um catálogo digital exclusivo para Lash Designers.',
            'greeting': 'Olá! Vi o anúncio do StudioMenu para Lash e quero meu catálogo!'
        },
        {
            'name': '[STUDIOMENU] AdSet 03 — Nail (Vídeo)',
            'budget': '1500',
            'targeting': nail_targeting,
            'type': 'video',
            'video_id': nail_video_id,
            'image_hash': nail_img_hash,
            'ad_name': 'Ad 03 - StudioMenu Nail (Vídeo)',
            'message': 'Seus trabalhos de Nail Art e alongamento merecem uma apresentação impecável. Conheça o StudioMenu!',
            'greeting': 'Olá! Vi o vídeo do StudioMenu para Nail e quero meu catálogo de unhas!'
        },
        {
            'name': '[STUDIOMENU] AdSet 04 — Nail (Imagem)',
            'budget': '1000',
            'targeting': nail_targeting,
            'type': 'image',
            'image_hash': nail_img_hash,
            'ad_name': 'Ad 04 - StudioMenu Nail (Imagem)',
            'message': 'Apresente seus serviços de manicure e alongamentos com elegância máxima no celular da sua cliente.',
            'greeting': 'Olá! Vi o anúncio do StudioMenu para Nail e quero meu catálogo de unhas!'
        }
    ]

    deployed_summary = []

    for idx, cfg in enumerate(adsets_config, 1):
        print(f"\n🎯 [{idx}/4] Processing AdSet: {cfg['name']}...")
        
        if cfg['name'] in existing_adsets_map:
            adset_id = existing_adsets_map[cfg['name']]
            print(f"⏩ AdSet already exists! ID: {adset_id}")
        else:
            adset_payload = {
                'name': cfg['name'],
                'campaign_id': campaign_id,
                'daily_budget': cfg['budget'],
                'billing_event': 'IMPRESSIONS',
                'optimization_goal': 'OFFSITE_CONVERSIONS',
                'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
                'destination_type': 'WEBSITE',
                'promoted_object': json.dumps({'pixel_id': PIXEL_ID, 'custom_event_type': 'PURCHASE'}),
                'targeting': json.dumps(cfg['targeting']),
                'start_time': START_TIME,
                'status': 'ACTIVE'
            }
            adset_res = meta_post(f"{ACCOUNT_ID}/adsets", adset_payload)
            adset_id = adset_res['id']
            print(f"✅ AdSet Created! ID: {adset_id}")

            wa_link = f"https://wa.me/{WHATSAPP_NUMBER}?text={urllib.parse.quote(cfg['greeting'])}"

            print(f"🎨 Creating Creative for {cfg['ad_name']}...")
            if cfg['type'] == 'image':
                story_spec = {
                    'page_id': PAGE_ID,
                    'link_data': {
                        'message': cfg['message'],
                        'link': wa_link,
                        'name': 'Falar no WhatsApp • Atendimento Rápido',
                        'description': 'StudioMenu • Catálogo Digital para Estúdios',
                        'image_hash': cfg['image_hash'],
                        'call_to_action': {
                            'type': 'WHATSAPP_MESSAGE',
                            'value': {
                                'app_destination': 'WHATSAPP'
                            }
                        }
                    }
                }
            else:
                story_spec = {
                    'page_id': PAGE_ID,
                    'video_data': {
                        'video_id': cfg['video_id'],
                        'image_hash': cfg['image_hash'],
                        'message': cfg['message'],
                        'title': 'Falar no WhatsApp • Atendimento Rápido',
                        'call_to_action': {
                            'type': 'WHATSAPP_MESSAGE',
                            'value': {
                                'app_destination': 'WHATSAPP'
                            }
                        }
                    }
                }

            creative_payload = {
                'name': f"Creative - {cfg['ad_name']}",
                'object_story_spec': json.dumps(story_spec)
            }
            creative_res = meta_post(f"{ACCOUNT_ID}/adcreatives", creative_payload)
            creative_id = creative_res['id']
            print(f"✅ Creative Created! ID: {creative_id}")

            print(f"📣 Creating Ad: {cfg['ad_name']}...")
            ad_res = meta_post(f"{ACCOUNT_ID}/ads", {
                'name': cfg['ad_name'],
                'adset_id': adset_id,
                'creative': json.dumps({'creative_id': creative_id}),
                'status': 'ACTIVE'
            })
            ad_id = ad_res['id']
            print(f"✅ Ad Created! ID: {ad_id}")

        deployed_summary.append({
            'adset_name': cfg['name'],
            'adset_id': adset_id,
            'budget': f"R$ {int(cfg['budget'])/100:.2f}/dia",
            'ad_name': cfg['ad_name'],
            'greeting': cfg['greeting']
        })

    print("\n" + "="*60)
    print("🎉 DEPLOYMENT COMPLETE & SUCCESSFUL!")
    print("="*60)
    print(f"📊 Campaign Name: [STUDIOMENU] - CAMPANHA WHATSAPP X1 🚀")
    print(f"📊 Campaign ID: {campaign_id}")
    print(f"📅 Scheduled Start Time: {START_TIME} (Amanhã 01/10 às 06:00)")
    print(f"💰 Total Daily Budget: R$ 50,00/dia em 4 AdSets")
    print("\nSummary of Created AdSets & Ads:")
    for item in deployed_summary:
        print(f" • {item['adset_name']} ({item['budget']}) | ID: {item['adset_id']}")
        print(f"   WhatsApp Mensagem: \"{item['greeting']}\"")

if __name__ == '__main__':
    main()
