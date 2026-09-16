import urllib.request
import json
import time

project_id = 'proj_06710f64'
niche = 'Female'

print(f"Starting research for '{niche}' on {project_id}...")
req = urllib.request.Request(
    'http://127.0.0.1:8000/api/research/start',
    data=json.dumps({'project_id': project_id, 'niche': niche}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
session_id = res['session_id']
print(f"Session ID: {session_id}")

for i in range(25):
    time.sleep(1)
    status_req = urllib.request.Request(f'http://127.0.0.1:8000/api/research/status/{session_id}')
    status = json.loads(urllib.request.urlopen(status_req).read().decode('utf-8'))
    print(f"Poll {i+1}: {status.get('status')} {status.get('completed_count')}/8")
    if status.get('status') in ['COMPLETED', 'FAILED']:
        print("Final logs:")
        for l in status.get('logs', []):
            safe_l = l.encode('ascii', errors='replace').decode('ascii')
            print("  ", safe_l)
        break

cands_req = urllib.request.Request(f'http://127.0.0.1:8000/api/candidates/{project_id}')
cands = json.loads(urllib.request.urlopen(cands_req).read().decode('utf-8'))
print(f"CANDIDATES COUNT: {len(cands)}")
for c in cands[:3]:
    t = c.get('title', '').encode('ascii', errors='replace').decode('ascii')
    print(f"  Title: {t} | Score: {c.get('winning_score')} | Orders: {c.get('daily_orders')}/day | Rev: ${c.get('daily_revenue')}/day")
