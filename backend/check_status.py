import urllib.request
import json
import time
import sys

sid = 'sess_98f412a9'
for i in range(25):
    try:
        res = urllib.request.urlopen('http://127.0.0.1:8000/api/research/status/' + sid)
        d = json.loads(res.read().decode())
        logs = d.get('logs', [])
        last_log = logs[-1].encode('ascii', 'replace').decode('ascii') if logs else ''
        print(f"{d.get('progress')}% - {d.get('stage')} - {last_log}")
        if d.get('stage') == 'COMPLETED':
            print("Session completed successfully!")
            break
    except Exception as e:
        print(f"Err: {e}")
    time.sleep(3)
