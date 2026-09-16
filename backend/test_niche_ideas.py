import urllib.request
import json

base = "http://127.0.0.1:8000"
test_niches = [
    "Dog Training",
    "Wall Pilates",
    "Woodworking",
    "ADHD",
    "Personal Finance",
    "Spanish Learning",
    "Real Estate",
    "Somatic Therapy"
]

print("=== TESTING NICHE-SPECIFIC DISCOVERY VIA LIVE API ===")
for q in test_niches:
    payload = json.dumps({"query": q}).encode("utf-8")
    req = urllib.request.Request(
        f"{base}/api/research/discover-ideas",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    
    ideas = data.get("ideas", [])
    print(f"\n[NICHE: '{q}'] -> Discovered {len(ideas)} specific opportunities:")
    for idx, idea in enumerate(ideas[:3], start=1):
        print(f"  {idx}. {idea['niche']}")
        print(f"     Daily Orders: {idea['daily_orders']}+/day (>=10: {idea['daily_orders'] >= 10}) | Revenue: ${idea['daily_revenue']}/day (>=100: {idea['daily_revenue'] >= 100})")
        print(f"     Category: {idea['category']} | Benchmark: {idea['bestseller_benchmark']}")
