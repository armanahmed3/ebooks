import urllib.request
import json
import time

base = "http://127.0.0.1:8000"

# 1. Projects
req = urllib.request.Request(f"{base}/api/projects")
with urllib.request.urlopen(req) as resp:
    projs = json.loads(resp.read().decode("utf-8"))
proj_id = projs[0]["id"] if projs else "default_project"
print(f"Projects found: {len(projs)}. Target Project ID: {proj_id}")

# 2. Phase 1: Discover Ideas
req = urllib.request.Request(
    f"{base}/api/research/discover-ideas",
    data=json.dumps({}).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as resp:
    ideas_data = json.loads(resp.read().decode("utf-8"))
ideas = ideas_data.get("ideas", [])
print(f"Phase 1 Discovered {len(ideas)} High-Velocity Ideas.")
top_idea = ideas[0]
print(f"Top #1 Profitable Idea: {top_idea['niche']}")
print(f"Daily Orders: {top_idea['daily_orders']}+/day | Daily Revenue: ${top_idea['daily_revenue']}/day | Price: ${top_idea['avg_price']}")

# 3. Clear Candidates to test fresh run
req = urllib.request.Request(
    f"{base}/api/candidates/{proj_id}/clear",
    data=b"{}",
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as resp:
    print("Candidates cleared successfully:", resp.read().decode("utf-8")[:80])

# 4. Phase 2: Start Research for the #1 Most Profitable Idea
print(f"\nStarting Phase 2 Live Verification for '{top_idea['niche']}' across all 8 platforms...")
payload = {
    "project_id": proj_id,
    "niche": top_idea["niche"],
    "mode": "standard"
}
req = urllib.request.Request(
    f"{base}/api/research/start",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as resp:
    start_res = json.loads(resp.read().decode("utf-8"))
session_id = start_res["session_id"]
print(f"Research session started: {session_id}")

# 5. Poll Session until COMPLETED
for attempt in range(40):
    time.sleep(2)
    req = urllib.request.Request(f"{base}/api/research/status/{session_id}")
    with urllib.request.urlopen(req) as resp:
        status_data = json.loads(resp.read().decode("utf-8"))
    
    current_status = status_data.get("status")
    platforms = status_data.get("platforms_status", {})
    completed_platforms = [k for k, v in platforms.items() if v == "completed"]
    print(f"Poll {attempt+1}: Status={current_status} | Completed {len(completed_platforms)}/{len(platforms)} platforms: {completed_platforms}")
    
    if current_status in ["COMPLETED", "FAILED"]:
        break

# 6. Verify 8 Platforms Status
print("\n--- ALL 8 PLATFORMS STATUS CHECK ---")
for plat, stat in platforms.items():
    check_mark = "✓ Verified" if stat == "completed" else f"x {stat}"
    print(f"{plat}: {check_mark}")

# 7. Check Generated Candidates
req = urllib.request.Request(f"{base}/api/candidates/{proj_id}")
with urllib.request.urlopen(req) as resp:
    candidates = json.loads(resp.read().decode("utf-8"))

print(f"\nPhase 2 Scored Candidates: {len(candidates)}")
for c in candidates:
    print(f"\nCandidate: {c['title']}")
    print(f"  Score: {c['winning_score']} / 100")
    print(f"  Daily Orders: {c.get('daily_orders')}+/day (Min 10 enforced: {c.get('daily_orders', 0) >= 10})")
    print(f"  Daily Revenue: ${c.get('daily_revenue')}/day (Min $100 enforced: {c.get('daily_revenue', 0) >= 100})")
    print(f"  Anchor Competitor: {c.get('target_competitor')}")
    print(f"  Cross-Platform Proof: {c.get('cross_platform_verified')}")
