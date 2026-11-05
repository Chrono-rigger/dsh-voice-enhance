import json, base64, subprocess, urllib.request

def token():
    out = subprocess.run(["git", "credential", "fill"], input="protocol=https\nhost=github.com\n",
                         capture_output=True, text=True).stdout
    for line in out.splitlines():
        if line.startswith("password="):
            return line.split("=", 1)[1]
    raise SystemExit("no token")

TOKEN = token()
HDR = {"Authorization": "token " + TOKEN,
       "Accept": "application/vnd.github+json",
       "Content-Type": "application/json",
       "User-Agent": "dsh-voice-enhance-publisher"}
API = "https://api.github.com"

def api(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, headers=HDR,
                                 data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
            return json.loads(data) if data else {}
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:400])
        raise SystemExit(1)

UP = "awesome-dsh-plugin/awesome-dsh-plugin"
FORK = "Chrono-rigger/awesome-dsh-plugin"

# 1. upstream head sha + whether the file already exists there
up = api("GET", f"/repos/{UP}")
head = up["default_branch"]
ref = api("GET", f"/repos/{UP}/git/ref/heads/{head}")["object"]["sha"]
print("upstream head:", ref[:10])

try:
    exists = api("GET", f"/repos/{UP}/contents/data/plugins/Chrono-rigger__dsh-voice-enhance.yml?ref={head}")
    print("file already on upstream:", "sha" in exists)
except SystemExit:
    print("file not on upstream yet (404) — good, proceeding")

# 2. create branch in fork
api("POST", f"/repos/{FORK}/git/refs", {"ref": "refs/heads/add-voice-enhance", "sha": ref})
print("branch created")

# 3. put the file (content from catalog/data-plugins.yml)
content = open("catalog/data-plugins.yml", encoding="utf-8").read()
api("PUT", f"/repos/{FORK}/contents/data/plugins/Chrono-rigger__dsh-voice-enhance.yml",
    {"message": "Add dsh-voice-enhance to the catalog",
     "content": base64.b64encode(content.encode()).decode(),
     "branch": "add-voice-enhance"})
print("file written to fork")

# 4. open the PR
pr = api("POST", f"/repos/{UP}/pulls",
    {"title": "Add dsh-voice-enhance (voice dictation + prompt enhance)",
     "head": "Chrono-rigger:add-voice-enhance",
     "base": head,
     "body": "Adds `data/plugins/Chrono-rigger__dsh-voice-enhance.yml` — voice push-to-talk dictation with minimal cleanup, plus a composer button that rewrites the draft into a clearer prompt. Category: voice. Single entry in this PR."})
print("PR opened:", pr.get("html_url", pr.get("message")))
