#!/usr/bin/env python3
"""
Synthetic RADIUS Accounting Event Feeder Script.
Simulates an enterprise edge collector or RADIUS syslog listener
streaming accounting start/stop events to the Django Wi-Fi Ingestion Gateway.
"""

import sys
import json
import urllib.request
import urllib.error
import datetime

DEFAULT_API_URL = "http://localhost:8000/api/v1/internal/wifi-events/"
DEFAULT_SERVICE_TOKEN = "hrm-internal-service-token-wifi-collector-2026"


def send_wifi_batch(api_url=DEFAULT_API_URL, service_token=DEFAULT_SERVICE_TOKEN, payload=None):
    if payload is None:
        now = datetime.datetime.now(datetime.timezone.utc)
        start_time = now - datetime.timedelta(hours=8)
        end_time = now - datetime.timedelta(minutes=30)
        duration = int((end_time - start_time).total_seconds())

        payload = {
            "batch_id": f"sim-feeder-{int(now.timestamp())}",
            "events": [
                {
                    "called_station_id": "00:1A:1E:17:F1:80",
                    "user_name": "alex.rivera",
                    "calling_station_id": "4A:7B:9C:12:34:56",
                    "nas_ip_address": "10.0.1.1",
                    "session_start": start_time.isoformat(),
                    "session_end": end_time.isoformat(),
                    "session_duration_seconds": duration,
                },
                {
                    "called_station_id": "00:1A:1E:17:F1:81",
                    "user_name": "marcus.brody",
                    "calling_station_id": "4A:7B:9C:12:34:88",
                    "nas_ip_address": "10.0.1.2",
                    "session_start": (start_time + datetime.timedelta(minutes=35)).isoformat(),
                    "session_end": end_time.isoformat(),
                    "session_duration_seconds": duration - 2100,
                },
            ],
        }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-Service-Token": service_token,
            "User-Agent": "Enterprise-RADIUS-Collector/1.0",
        },
        method="POST",
    )

    print(f"[*] Posting batch {payload.get('batch_id')} to {api_url}...")
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode("utf-8")
            status_code = response.status
            print(f"[✓] Success ({status_code}): {res_body}")
            return json.loads(res_body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"[✗] HTTP Error ({e.code}): {err_body}")
        return None
    except urllib.error.URLError as e:
        print(f"[✗] Connection Failed: {e.reason}")
        print("    Ensure backend server is running on http://localhost:8000")
        return None


if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_API_URL
    token = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_SERVICE_TOKEN
    send_wifi_batch(api_url=url, service_token=token)
