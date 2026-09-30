import urllib.request
import urllib.parse
import ssl
import json

TOKEN = 'EAAWMnrVYZAnsBSrMzKiZCQtQvpldkRRxMV1ovzrPRhrlJQZC6ckN3u3t5Cm2BNI3wceThZA6QwSMwA4LZBjfpfLlLwC63d7f5iX3fG1ldn2nNvvdvaABS8ZCFQG9RVYSxAtjnZAIvbN5bIZB6zPEU2HDU1gElHW1ZCSRrgbJYnuIG0GKDxoboEAZAuU5eyk2ZCHgmEd1gu1kGtOJIBnlsfrZBtKlBdUX56nSEL33rzwN0bxPhJxf4EXoJHgP96ZAtHWUWGlZC6K18mEpZBlXQDuy76vRLw6cZAyvEqkTwsluMEhx3w8ZD'
ACCOUNT_ID = 'act_1626088674941828'
PAGE_ID = '1184875188046307'
WHATSAPP_NUMBER = '5562991083435'
CAMPAIGN_ID = '120248312256100218'

ctx = ssl._create_unverified_context()

def meta_get(endpoint):
    sep = '&' if '?' in endpoint else '?'
    url = f"https://graph.facebook.com/v20.0/{endpoint}{sep}access_token={TOKEN}"
    req = urllib.request.Request(url, method='GET')
    res = urllib.request.urlopen(req, context=ctx)
    return json.loads(res.read().decode('utf-8'))

def meta_post(endpoint, payload):
    url = f"https://graph.facebook.com/v20.0/{endpoint}"
    payload['access_token'] = TOKEN
    data = urllib.parse.urlencode(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, method='POST')
    res = urllib.request.urlopen(req, context=ctx)
    return json.loads(res.read().decode('utf-8'))

updates = {
    'Ad 01 - StudioMenu Lash (Vídeo)': {
        'type': 'video',
        'video_id': '1799748824690062',
        'image_hash': 'bd24b1f27514b24416d1041e628e51cc',
        'message': 'Transforme a apresentação dos seus procedimentos de lash em um catálogo digital luxuoso e impressione suas clientes!',
        'greeting': 'Olá, vi o vídeo do Catálogo Digital para Lash e quero saber como funciona.'
    },
    'Ad 02 - StudioMenu Lash (Imagem)': {
        'type': 'image',
        'image_hash': 'bd24b1f27514b24416d1041e628e51cc',
        'message': 'Eleve a imagem do seu estúdio com um catálogo digital exclusivo para Lash Designers.',
        'greeting': 'Olá, vi o anúncio do Catálogo Digital para Lash e quero saber como funciona.'
    },
    'Ad 03 - StudioMenu Nail (Vídeo)': {
        'type': 'video',
        'video_id': '2252107502247176',
        'image_hash': '2dbf038efd45f56ef9adddec57fa381a',
        'message': 'Seus trabalhos de Nail Art e alongamento merecem uma apresentação impecável. Conheça o catálogo digital!',
        'greeting': 'Olá, vi o vídeo do Catálogo Digital para Nail e quero saber como funciona.'
    },
    'Ad 04 - StudioMenu Nail (Imagem)': {
        'type': 'image',
        'image_hash': '2dbf038efd45f56ef9adddec57fa381a',
        'message': 'Apresente seus serviços de manicure e alongamentos com elegância máxima no celular da sua cliente.',
        'greeting': 'Olá, vi o anúncio do Catálogo Digital para Nail e quero saber como funciona.'
    }
}

print("🔄 Updating WhatsApp Greetings (Generic / Catálogo Digital)...")

ads_res = meta_get(f"{CAMPAIGN_ID}/ads?fields=id,name,creative")
for ad in ads_res.get('data', []):
    ad_id = ad['id']
    ad_name = ad['name']
    if ad_name in updates:
        cfg = updates[ad_name]
        wa_link = f"https://wa.me/{WHATSAPP_NUMBER}?text={urllib.parse.quote(cfg['greeting'])}"
        
        print(f"\n🎨 Creating updated creative for: {ad_name}...")
        if cfg['type'] == 'image':
            story_spec = {
                'page_id': PAGE_ID,
                'link_data': {
                    'message': cfg['message'],
                    'link': wa_link,
                    'name': 'Falar no WhatsApp • Atendimento Rápido',
                    'description': 'Catálogo Digital para Estúdios de Beleza',
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
            'name': f"Creative (Catálogo Digital) - {ad_name}",
            'object_story_spec': json.dumps(story_spec)
        }
        c_res = meta_post(f"{ACCOUNT_ID}/adcreatives", creative_payload)
        new_creative_id = c_res['id']
        print(f"✅ New Creative ID: {new_creative_id}")

        print(f"✏️ Updating Ad {ad_name} (ID: {ad_id})...")
        meta_post(ad_id, {'creative': json.dumps({'creative_id': new_creative_id})})
        print(f"✅ Ad updated with greeting: \"{cfg['greeting']}\"")

print("\n🎉 ALL ADS UPDATED SUCCESSFULLY!")
