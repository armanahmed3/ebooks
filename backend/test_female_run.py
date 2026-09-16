import urllib.request
import json
import time

base = "http://127.0.0.1:8000"
req = urllib.request.Request(f"{base}/api/projects")
projs = json.loads(urllib.request.urlopen(req).read().decode())
p_id = projs[0]["id"]

print(f"Testing start research for: 'Female' on project {p_id}")
payload = json.dumps({"project_id": p_id, "niche": "Female", "mode": "standard"}).encode()
req = urllib.request.Request(f"{base}/api/research/start", data=payload, headers={"Content-Type": "application/json"})
res = json.loads(urllib.request.urlopen(req).read().decode())
sess_id = res["session_id"]
print("Started session:", sess_id)

for i in range(35):
    time.sleep(2)
    req = urllib.request.Request(f"{base}/api/research/status/{sess_id}")
    st = json.loads(urllib.request.urlopen(req).read().decode())
    status = st.get("status")
    print(f"Poll {i+1}: status={status} completed={st.get('completed_count')}/8")
    if status in ["COMPLETED", "FAILED"]:
        print("Final status reached:", status)
        for l in st.get("logs", [])[-4:]:
            print("  log:", l)
        break

req = urllib.request.Request(f"{base}/api/candidates/{p_id}")
cands = json.loads(urllib.request.urlopen(req).read().decode())
print(f"Candidates generated for Female: {len(cands)}")
for c in cands:
    print(f"  - Title: {c['title']} | Score: {c['winning_score']} | Orders: {c['daily_orders']} | Rev: ${c['daily_revenue']}")
