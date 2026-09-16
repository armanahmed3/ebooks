import urllib.request
import json
import time

url = "http://127.0.0.1:8000/api/book/generate-batch"
payload = {
    "project_id": "proj_06710f64",
    "start_page": 1,
    "end_page": 10
}

t0 = time.time()
print("Starting batch generation for pages 1-10...")
req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req, timeout=120) as response:
        data = json.loads(response.read().decode("utf-8"))
        t1 = time.time()
        print(f"Batch generation completed in {t1 - t0:.2f}s!")
        print(f"Total pages written: {data.get('pages_written')}\n")
        for p in data.get("pages", []):
            print(f"=== PAGE {p['page_number']}: {p['title']} ({p['word_count']} words) ===")
            print(p["content"][:200] + "...\n")
except Exception as e:
    print("Error:", e)
