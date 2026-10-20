import urllib.request
import urllib.parse
import ssl
import json

ctx = ssl._create_unverified_context()

TOKEN = 'EAAWMnrVYZAnsBSxTBTa5oYYt33ysfXi4ZCkNZAc0FoUUzzdHGBpnnRvMwqhdIIrHAv84QGtUr2x7vZCZB5Kb2oP6lnBcWF76vZAt2ZCL1R9McXXyRt87QZAHMMGwWZBLYUYICFMrIRwt4Pc3eReYQlqQTrklN1mMO0LGCKsZBmiaIJJLohZCJkBZA6zq0hf4Xgwtys8IeOGNI9ZCoLbFSlZC3qKG733OwIGI9lfLxeRRxLJgBlejZCZCVGMTofhklyzyduZAJbJfnZAZBZBYVoj7s9K7MyyyFecsgRNODunKKNyVaIZCjSfLz'
ACCOUNT_ID = 'act_1626088674941828'

def get(endpoint, params=None):
    if params is None:
        params = {}
    params['access_token'] = TOKEN
    qs = urllib.parse.urlencode(params)
    url = f"https://graph.facebook.com/v20.0/{endpoint}?{qs}"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        print(f"Error {e.code} on {endpoint}: {e.read().decode()}")
        return None

def main():
    print("=== CAMPAIGNS ===")
    campaigns = get(f"{ACCOUNT_ID}/campaigns", {
        "fields": "id,name,status,objective,daily_budget,lifetime_budget,created_time"
    })
    print(json.dumps(campaigns, indent=2))

    if campaigns and campaigns.get('data'):
        for c in campaigns['data']:
            cid = c['id']
            print(f"\n--- ADSETS FOR CAMPAIGN {c['name']} ({cid}) ---")
            adsets = get(f"{cid}/adsets", {
                "fields": "id,name,status,daily_budget,optimization_goal,destination_type,promoted_object,targeting,start_time"
            })
            print(json.dumps(adsets, indent=2))

            print(f"\n--- ADS FOR CAMPAIGN {c['name']} ({cid}) ---")
            ads = get(f"{cid}/ads", {
                "fields": "id,name,status,adset_id,creative{id,name,title,body,object_story_spec,asset_feed_spec}"
            })
            print(json.dumps(ads, indent=2))

if __name__ == "__main__":
    main()
