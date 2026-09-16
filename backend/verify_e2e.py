import urllib.request
import json
import time
import sys

# 1. Clear previous candidates
print("=== 1. Clearing Previous Candidates ===")
req_clear = urllib.request.Request('http://127.0.0.1:8000/api/candidates/proj_06710f64/clear', method='POST')
res_clear = urllib.request.urlopen(req_clear)
print("Clear result:", res_clear.read().decode())

# 2. Trigger Autopilot without specifying niche -> system auto-discovers next Page 1 bestseller niche
print("\n=== 2. Triggering Autonomous Autopilot ===")
payload = json.dumps({"project_id": "proj_06710f64", "depth": "quick"}).encode("utf-8")
req_auto = urllib.request.Request(
    'http://127.0.0.1:8000/api/research/autonomous-autopilot',
    data=payload,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
res_auto = urllib.request.urlopen(req_auto)
auto_data = json.loads(res_auto.read().decode())
print("Autopilot started for niche:", auto_data.get("niche"))
session_id = auto_data.get("session_id")
print("Session ID:", session_id)

# 3. Poll research session until completion
print("\n=== 3. Polling Autopilot Progress ===")
for i in range(40):
    try:
        res = urllib.request.urlopen(f'http://127.0.0.1:8000/api/research/status/{session_id}')
        d = json.loads(res.read().decode())
        logs = d.get('logs', [])
        last_log = logs[-1].encode('ascii', 'replace').decode('ascii') if logs else ''
        status = d.get('status') or d.get('stage')
        print(f"[{status}] {d.get('progress')}% - {last_log}")
        if status == 'COMPLETED':
            print("Session completed successfully!")
            break
        elif status == 'ERROR':
            print("Session reported error:", d.get('error'))
            break
    except Exception as e:
        print("Polling error:", e)
    time.sleep(3)

# 4. Verify candidate created with Page 1 features and pricing
print("\n=== 4. Verifying Scored Candidate Opportunity ===")
res_cands = urllib.request.urlopen('http://127.0.0.1:8000/api/candidates/proj_06710f64')
cands = json.loads(res_cands.read().decode())
print(f"Found {len(cands)} candidates.")
if cands:
    c = cands[0]
    print(f"Title: {c.get('title')}")
    print(f"Amazon Page 1 Rank: #{c.get('page_1_rank')} ({c.get('bsr_rank')})")
    print(f"Pricing: Avg ${c.get('average_price')} | Best ${c.get('best_price')}")
    print(f"Page 1 Features: {c.get('page_1_features')}")
    print(f"Added Features: {c.get('added_features')}")
