import requests, time, json, sys

BASE = "http://127.0.0.1:5000"

# 1. Upload PDF
print("=== 1. Uploading PDF ===")
with open("test_upload.pdf", "rb") as f:
    resp = requests.post(f"{BASE}/upload", files={"pdf_file": ("test_upload.pdf", f, "application/pdf")}, data={"lang": "en"})
data = resp.json()
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(data, indent=2)}")

if resp.status_code != 200:
    print("UPLOAD FAILED")
    sys.exit(1)

job_id = data["job_id"]
pages = data["pages"]
chars = data["char_count"]
print(f"Job ID: {job_id}")
print(f"Pages: {pages}, Chars: {chars}")

# 2. Poll status
print("\n=== 2. Polling Status ===")
audio_filename = None
for i in range(30):
    time.sleep(2)
    status_resp = requests.get(f"{BASE}/status/{job_id}")
    status_data = status_resp.json()
    print(f"Poll {i+1}: {status_data['status']}")
    if status_data["status"] == "completed":
        audio_filename = status_data["audio_filename"]
        print(f"Audio file: {audio_filename}")
        break
    elif status_data["status"] == "error":
        print(f"ERROR: {status_data.get('message', 'unknown')}")
        sys.exit(1)
else:
    print("TIMEOUT")
    sys.exit(1)

# 3. Test player page
print("\n=== 3. Testing Player Page ===")
player_resp = requests.get(f"{BASE}/player/{audio_filename}")
print(f"Player page status: {player_resp.status_code}")
html = player_resp.text

checks = [
    ("Audio element", 'id="native-audio"' in html),
    ("Audio src set", f"/audio/{audio_filename}" in html),
    ("Play button", 'id="play-pause-btn"' in html),
    ("Seek slider", 'id="progress-bar"' in html),
    ("Download link", f"/download/{audio_filename}" in html),
    ("Tailwind config in head", "tailwind-config" in html.split("</head>")[0]),
    ("No share btn in header", "more_vert" not in html),
    ("No footer links", "Terms of Service" not in html),
]
all_pass = True
for name, result in checks:
    status = "PASS" if result else "FAIL"
    if not result:
        all_pass = False
    print(f"  [{status}] {name}")

# 4. Test audio stream
print("\n=== 4. Testing Audio Stream ===")
audio_resp = requests.get(f"{BASE}/audio/{audio_filename}")
print(f"Audio response status: {audio_resp.status_code}")
print(f"Content-Type: {audio_resp.headers.get('Content-Type', 'unknown')}")
print(f"Audio size: {len(audio_resp.content)} bytes")
is_mp3 = audio_resp.content[:3] == b"ID3" or audio_resp.content[:2] == b"\xff\xfb"
print(f"Valid MP3 header: {is_mp3}")

# 5. Test download route
print("\n=== 5. Testing Download Route ===")
dl_resp = requests.get(f"{BASE}/download/{audio_filename}")
print(f"Download status: {dl_resp.status_code}")
has_attachment = "attachment" in dl_resp.headers.get("Content-Disposition", "")
print(f"Content-Disposition attachment: {has_attachment}")

# 6. Test homepage
print("\n=== 6. Testing Homepage ===")
home_resp = requests.get(f"{BASE}/")
home_html = home_resp.text
home_checks = [
    ("Homepage 200", home_resp.status_code == 200),
    ("Tailwind config in head", "tailwind-config" in home_html.split("</head>")[0]),
    ("Upload form present", 'id="upload-form"' in home_html),
    ("File input present", 'id="file-input"' in home_html),
    ("Language selector", 'id="language-select"' in home_html),
    ("No dummy nav links", "Pricing" not in home_html),
    ("No Get Started button", "Get Started" not in home_html),
]
for name, result in home_checks:
    status = "PASS" if result else "FAIL"
    if not result:
        all_pass = False
    print(f"  [{status}] {name}")

print("\n" + "=" * 40)
if all_pass:
    print("ALL TESTS PASSED!")
else:
    print("SOME TESTS FAILED - review above")
