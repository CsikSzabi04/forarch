import sys
import time
import requests
import subprocess
from datetime import datetime
import threading
import re
import os
import glob
import ctypes

API_KEY = "AIzaSyC-tf3X4plkjIovtD59phQ7O_4aUTDisCo"
PROJECT_ID = "forarch-399d6"
FB_AUTH_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
FB_DB_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

ACTIVE_SUBPROCESSES = []
SUBPROCESS_LOCK = threading.Lock()

def prompt_login():
    try:
        ans = input("Do you want to sign in to sync with Web Remote Terminal? (y/N): ")
        if ans.lower() == 'y':
            email = input("Email: ")
            import getpass
            password = getpass.getpass("Password: ")
            print("Authenticating...")
            res = requests.post(FB_AUTH_URL, json={"email": email, "password": password, "returnSecureToken": True})
            if res.status_code == 200:
                data = res.json()
                print("Login successful! Sync activated.")
                return {"uid": data["localId"], "token": data["idToken"], "email": email}
            else:
                print(f"Login failed: {res.json().get('error', {}).get('message', 'Unknown Error')}")
                return None
    except:
        pass
    return None

FB_CREDS = None
def set_fb_creds(creds):
    global FB_CREDS
    FB_CREDS = creds

def post_log(msg):
    if not FB_CREDS: return
    try:
        doc = {
            "fields": {
                "msg": {"stringValue": msg},
                "timestamp": {"timestampValue": datetime.utcnow().isoformat() + "Z"}
            }
        }
        headers = {"Authorization": f"Bearer {FB_CREDS['token']}"}
        url = f"{FB_DB_URL}/hubs/{FB_CREDS['uid']}/logs"
        requests.post(url, json=doc, headers=headers, timeout=2)
    except:
        pass

import re

class RemoteHub:
    def __init__(self, creds):
        self.creds = creds
        self.original_stdout = sys.__stdout__
        self.log_queue = []
        self.session_buffer = [] # Persistent buffer for /save command
        self.lock = threading.Lock()
        threading.Thread(target=self._sender_loop, daemon=True).start()
        
    def _sender_loop(self):
        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        while True:
            time.sleep(1)
            with self.lock:
                if not self.log_queue:
                    continue
                chunk = "".join(self.log_queue)
                self.log_queue.clear()
            
            if chunk.strip():
                now = datetime.now().strftime("%H:%M:%S")
                # Prepend timestamp to each line if it's not already there
                timestamped = f"[dim][{now}][/] {chunk}"
                post_log(timestamped)

    def write(self, s):
        self.original_stdout.write(s)
        with self.lock:
            self.log_queue.append(s)
            self.session_buffer.append(s) # Store for saving later
            
    def flush(self):
        self.original_stdout.flush()

def run_command_streamed(cmd_val):
    """Executes a command and streams output in real-time."""
    try:
        # Use shell=True to support piping and complex commands
        process = subprocess.Popen(
            cmd_val, 
            shell=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT, 
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        with SUBPROCESS_LOCK:
            ACTIVE_SUBPROCESSES.append(process)
        
        # Stream lines as they arrive
        for line in process.stdout:
            sys.stdout.write(line)
            
        process.wait()
        with SUBPROCESS_LOCK:
            if process in ACTIVE_SUBPROCESSES:
                ACTIVE_SUBPROCESSES.remove(process)
    except Exception as e:
        print(f"\n[Remote Error]: {str(e)}")

def start_command_listener(creds):
    headers = {"Authorization": f"Bearer {creds['token']}"}
    last_processed = set()
    print(f"\n[Remote Hub] Listener active for {creds['email']}. Waiting for commands...")
    
    # Pre-fetch existing commands to avoid executing stale ones on startup
    try:
        res = requests.get(f"{FB_DB_URL}/hubs/{creds['uid']}/commands", headers=headers, timeout=5)
        if res.status_code == 200:
            data = res.json()
            docs = data.get("documents", [])
            for d in docs:
                last_processed.add(d.get('name'))
    except:
        pass

    while True:
        try:
            # Short timeout (2s) to keep polling snappy
            res = requests.get(f"{FB_DB_URL}/hubs/{creds['uid']}/commands", headers=headers, timeout=5)
            
            if res.status_code == 200:
                if not connected_once:
                    print("[Remote Hub] Connected successfully to Cloud Hub.")
                    connected_once = True
                
                data = res.json()
                docs = data.get("documents", [])
                for d in docs:
                    doc_name = d.get('name')
                    if doc_name not in last_processed:
                        last_processed.add(doc_name)
                        # Process existing command
                        cmd_val = d.get('fields', {}).get('cmd', {}).get('stringValue', '').strip()
                        
                        if not cmd_val: continue
                        
                        is_slash = cmd_val.startswith('/')
                        if cmd_val == "STOP_FORARCH_CLI" or cmd_val == "/stop":
                            print("\n[Remote Hub] Stop Signal Received. Cleaning up...")
                            try:
                                requests.delete(f"https://firestore.googleapis.com/v1/{doc_name}", headers=headers, timeout=2)
                            except: pass
                            with SUBPROCESS_LOCK:
                                for p in ACTIVE_SUBPROCESSES:
                                    try: p.terminate()
                                    except: pass
                            print("[Remote Hub] Terminating ForArch.")
                            os._exit(0)
                        
                        if is_slash:
                            separator = "\n" + "─" * 50 + "\n"
                            if cmd_val == "/rewrite":
                                try: requests.delete(f"https://firestore.googleapis.com/v1/{doc_name}", headers=headers, timeout=2)
                                except: pass
                                print(separator)
                                print("[bold brand]REWRITE TRIGGERED[/] -> Restarting CLI...")
                                # Save session to env vars for recovery
                                os.environ['FORARCH_RECOVERY_UID'] = creds['uid']
                                os.environ['FORARCH_RECOVERY_TOKEN'] = creds['token']
                                os.environ['FORARCH_RECOVERY_EMAIL'] = creds['email']
                                os.execv(sys.executable, ['python'] + sys.argv)
                            elif cmd_val == "/cmd show":
                                if sys.platform == 'win32':
                                    hwnd = ctypes.windll.kernel32.GetConsoleWindow()
                                    if hwnd:
                                        ctypes.windll.user32.ShowWindow(hwnd, 9)
                                        ctypes.windll.user32.SetForegroundWindow(hwnd)
                                        print(separator)
                                        print("[bold success]WINDOW FOCUS[/] -> CMD is now active.")
                            elif cmd_val == "/clear":
                                os.system('cls' if os.name == 'nt' else 'clear')
                            elif cmd_val == "/manual":
                                manual_path = "MANUAL_REMOTE.txt"
                                if not os.path.exists(manual_path):
                                    with open(manual_path, "w", encoding="utf-8") as f:
                                        f.write("FORARCH REMOTE CLI MANUAL\n" + "="*30 + "\n\nCOMMANDS:\n")
                                        f.write("/stop    - Terminates the CLI process.\n")
                                        f.write("/rewrite - Restarts the CLI and returns to main menu (Session Persisted).\n")
                                        f.write("/cmd show- Brings the local CMD window to front (Windows).\n")
                                        f.write("/save    - Saves session logs to 'Scan Results/SaveWebResults_vX.X.X.txt'.\n")
                                        f.write("/clear   - Clears the console screen.\n")
                                        f.write("/manual  - Opens this documentation.\n\n")
                                        f.write("Note: All commands are non-blocking and work even during active scans.")
                                
                                print(separator)
                                print(f"[bold success]DOCUMENTATION[/] -> Opening manual...")
                                if os.name == 'nt':
                                    os.startfile(manual_path)
                                else:
                                    print(f"Manual at: {os.path.abspath(manual_path)}")
                            elif cmd_val == "/save":
                                out_dir = "Scan Results"
                                if not os.path.exists(out_dir): os.makedirs(out_dir)
                                existing = glob.glob(os.path.join(out_dir, "SaveWebResults_v*.txt"))
                                versions = []
                                for ex in existing:
                                    m = re.search(r'_v(\d+)\.(\d+)\.(\d+)', ex)
                                    if m: versions.append(list(map(int, m.groups())))
                                next_v = [1, 0, 0]
                                if versions:
                                    last = sorted(versions)[-1]
                                    next_v = [last[0], last[1], last[2] + 1]
                                v_str = ".".join(map(str, next_v))
                                fname = os.path.join(out_dir, f"SaveWebResults_v{v_str}.txt")
                                if isinstance(sys.stdout, RemoteHub):
                                    with open(fname, "w", encoding="utf-8") as f:
                                        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
                                        clean_content = ansi_escape.sub('', "".join(sys.stdout.session_buffer))
                                        f.write(clean_content)
                                    print(separator)
                                    print(f"[bold success]SESSION SAVED[/] -> {fname}")
                            
                            # delete the commmand doc after handling
                            try: requests.delete(f"https://firestore.googleapis.com/v1/{doc_name}", headers=headers, timeout=2)
                            except: pass
                            print(separator)

                        else:
                            print(f"\n[Remote Command Received]: {cmd_val}")
                            threading.Thread(target=run_command_streamed, args=(cmd_val,), daemon=True).start()
                            try: requests.delete(f"https://firestore.googleapis.com/v1/{doc_name}", headers=headers, timeout=2)
                            except: pass
            elif res.status_code == 401:
                print("\n[Remote Hub ERROR] Session Expired. Please restart CLI to sync again.")
                break
            elif res.status_code >= 400:
                print(f"\n[Remote Hub ERROR] Firestore API returned error {res.status_code}. Retrying...")
                
        except Exception as e:
            # print(f"\n[Remote Hub] Network error: {e}")
            pass
        time.sleep(0.5)

def intercept_execution():
    # Check for recovery session from environment variables first
    recovery_uid = os.environ.get('FORARCH_RECOVERY_UID')
    recovery_token = os.environ.get('FORARCH_RECOVERY_TOKEN')
    recovery_email = os.environ.get('FORARCH_RECOVERY_EMAIL')
    
    if recovery_uid and recovery_token and recovery_email:
        creds = {
            "uid": recovery_uid,
            "token": recovery_token,
            "email": recovery_email
        }
        print(f"\n[Remote Hub] Session recovered for {recovery_email}. Sync active.")
    else:
        creds = prompt_login()
        
    if creds:
        set_fb_creds(creds)
        rh = RemoteHub(creds)
        sys.stdout = rh
        sys.stderr = rh
        # start command listener daemon
        threading.Thread(target=start_command_listener, args=(creds,), daemon=True).start()

