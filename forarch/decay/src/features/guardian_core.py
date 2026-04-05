import os
import json
import shutil
import time
import subprocess
import datetime
import zipfile
from rich.console import Console

console = Console()

GUARDIAN_DIR = os.path.join(os.path.expanduser("~"), ".forarch", "guardian")
WATCHLIST_FILE = os.path.join(GUARDIAN_DIR, "forarch_watchlist.txt")
SCHEDULE_FILE = os.path.join(GUARDIAN_DIR, "forarch_schedule.json")
BACKUPS_DIR = os.path.join(GUARDIAN_DIR, "forarch_backups")
REPORTS_DIR = os.path.join(GUARDIAN_DIR, "forarch_reports")
HISTORY_FILE = os.path.join(GUARDIAN_DIR, "forarch_history.txt")
SAVED_PATHS_FILE = os.path.join(GUARDIAN_DIR, "saved_Paths.txt")

for d in [GUARDIAN_DIR, BACKUPS_DIR, REPORTS_DIR]:
    os.makedirs(d, exist_ok=True)

def init_saved_paths():
    if not os.path.exists(SAVED_PATHS_FILE):
        with open(SAVED_PATHS_FILE, "w", encoding="utf-8") as f:
            f.write("# Egy sor az egy elérési útvonal\n")
            f.write("# Ha többet akar, enterrel válaszd el őket\n\n")

def get_saved_paths():
    paths = []
    if os.path.exists(SAVED_PATHS_FILE):
        with open(SAVED_PATHS_FILE, "r", encoding="utf-8") as f:
            for line in f:
                p = line.strip()
                if p and not p.startswith("#"):
                    paths.append(p)
    return paths

def append_to_history(message):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")

def get_tool_version(cmd):
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return (result.stdout or result.stderr).strip().split('\n')[0]
    except Exception:
        return None

def check_global_tools():
    tools = [
        ("Node.js", ["node", "--version"]),
        ("Python", ["python", "--version"]),
        ("npm", ["npm", "--version"]),
        ("pip", ["pip", "--version"]),
        ("git", ["git", "--version"])
    ]
    results = {}
    for name, cmd in tools:
        ver = get_tool_version(cmd)
        if ver:
            results[name] = ver
    return results

def get_projects_in_path(base_path, max_depth=None):
    projects = []
    ignores = {'node_modules', '.git', 'venv', '.venv', 'dist', 'build'}
    try:
        base_depth = base_path.rstrip(os.path.sep).count(os.path.sep)
        for root, dirs, files in os.walk(base_path):
            current_depth = root.count(os.path.sep) - base_depth
            if max_depth is not None and current_depth >= max_depth:
                dirs[:] = []
                continue
            dirs[:] = [d for d in dirs if d not in ignores]
            if 'package.json' in files or 'requirements.txt' in files or 'pom.xml' in files:
                projects.append(root)
                dirs[:] = [] # Stop descending once a project is found
    except Exception:
        pass
    return projects

def scan_path(target_path, npm_reg, pypi_reg, maven_reg, single_project=False, max_depth=None):
    projects = [os.path.abspath(target_path)] if single_project else get_projects_in_path(target_path, max_depth=max_depth)
    if not projects:
        return "No projects found.", []

    from src.cli.forarch import analyze_manifest_file
    
    report_lines = []
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    report_lines.append(f"[{timestamp}] Scan started on {target_path}")
    
    tools = check_global_tools()
    if tools:
        report_lines.append("--- Global Tools ---")
        for tool, ver in tools.items():
            report_lines.append(f"  {tool}: {ver}")

    for proj in projects:
        report_lines.append(f"--- Projekt: {proj} ---")
        manifests = []
        for mf in ['package.json', 'requirements.txt', 'pom.xml']:
            mp = os.path.join(proj, mf)
            if os.path.exists(mp):
                manifests.append(mp)
                
        for path in manifests:
            _, results, _ = analyze_manifest_file(path, npm_reg, pypi_reg, maven_reg)
            if results:
                for res in results:
                    lib = res['library']
                    curr = res['current_version']
                    latest = res['latest_version']
                    status = "(outdated)" if latest != 'unknown' and current_to_clean(curr) != latest else ""
                    report_lines.append(f"  {lib}: {curr} -> latest {latest} {status}")
            else:
                report_lines.append(f"  [{os.path.basename(path)}] All dependencies up to date or unresolvable.")

    report_text = "\n".join(report_lines)
    return report_text, projects

def current_to_clean(ver_str):
    return ver_str.strip('^~<>="')

def save_watchlist(paths):
    existing = set()
    if os.path.exists(WATCHLIST_FILE):
        with open(WATCHLIST_FILE, "r", encoding="utf-8") as f:
            existing = set(line.strip() for line in f if line.strip())
    
    existing.update(os.path.abspath(p) for p in paths)
    with open(WATCHLIST_FILE, "w", encoding="utf-8") as f:
        for p in sorted(existing):
            f.write(p + "\n")
    return list(existing)

def get_watchlist():
    if not os.path.exists(WATCHLIST_FILE):
        return []
    with open(WATCHLIST_FILE, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

def do_updates(project_path, dry_run=True):
    from src.analyzer.registry import NPMRegistry, PyPIRegistry, MavenRegistry
    from src.cli.forarch import analyze_manifest_file
    
    npm_reg, pypi_reg, maven_reg = NPMRegistry(), PyPIRegistry(), MavenRegistry()
    manifests = []
    for mf in ['package.json', 'requirements.txt', 'pom.xml']:
        mp = os.path.join(project_path, mf)
        if os.path.exists(mp):
            manifests.append(mp)
            
    if not manifests:
        return f"No manifests found in {project_path}."

    log_lines = []
    log_lines.append(f"Update {'(DRY RUN) ' if dry_run else ''}applied to {project_path}")
    
    today_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join(BACKUPS_DIR, os.path.basename(project_path), today_str)

    has_updates = False
    
    for path in manifests:
        _, results, updates = analyze_manifest_file(path, npm_reg, pypi_reg, maven_reg)
        if not updates:
            continue
            
        has_updates = True
            
        if not dry_run:
            os.makedirs(backup_dir, exist_ok=True)
            shutil.copy2(path, os.path.join(backup_dir, os.path.basename(path)))
            
        if os.path.basename(path) == 'package.json':
            if not dry_run:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                for lib, new_v in updates.items():
                    if 'dependencies' in data and lib in data['dependencies']:
                        data['dependencies'][lib] = f"^{new_v}"
                    elif 'devDependencies' in data and lib in data['devDependencies']:
                        data['devDependencies'][lib] = f"^{new_v}"
                with open(path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                    
            for lib, new_v in updates.items():
                old_v = next((r['current_version'] for r in results if r['library'] == lib), "unknown")
                log_lines.append(f"  - {lib}: {old_v} -> {new_v} (success)")
                
        elif os.path.basename(path) == 'requirements.txt':
            if not dry_run:
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                with open(path, 'w', encoding='utf-8') as f:
                    for line in lines:
                        updated_line = line
                        for lib, new_v in updates.items():
                            if line.startswith(f"{lib}==") or line.strip() == lib:
                                updated_line = f"{lib}=={new_v}\n"
                        f.write(updated_line)
                        
            for lib, new_v in updates.items():
                old_v = next((r['current_version'] for r in results if r['library'] == lib), "unknown")
                log_lines.append(f"  - {lib}: {old_v} -> {new_v} (success)")

    if not has_updates:
        return "Everything is up to date."
        
    msg = "\n".join(log_lines)
    if not dry_run:
        append_to_history(msg)
    return msg

def rollback(project_path, date_str):
    proj_name = os.path.basename(project_path)
    proj_backups = os.path.join(BACKUPS_DIR, proj_name)
    if not os.path.exists(proj_backups):
        return f"No backups found for {proj_name}."
        
    matching_dirs = [d for d in os.listdir(proj_backups) if d.startswith(date_str.replace("-", ""))]
    if not matching_dirs:
        return f"No backup found for date {date_str}."
        
    latest_backup = sorted(matching_dirs)[-1] # Take the latest on that day
    target_backup_dir = os.path.join(proj_backups, latest_backup)
    
    restored = []
    for f in os.listdir(target_backup_dir):
        shutil.copy2(os.path.join(target_backup_dir, f), os.path.join(project_path, f))
        restored.append(f)
        
    append_to_history(f"Rollback performed to {date_str} for {project_path}. Restored: {', '.join(restored)}")
    return f"Rolled back {', '.join(restored)} from backup {latest_backup}."

def process_inactive(older_than_days, action, confirm=False):
    # This is a dangerous operation so it only works on watchlist or specific drive scan.
    # We will check the last modified time of the project folder.
    watchlist = get_watchlist()
    older_than = time.time() - (older_than_days * 86400)
    
    inactive = []
    for p in watchlist:
        if os.path.exists(p):
            mtime = os.path.getmtime(p)
            if mtime < older_than:
                inactive.append(p)
                
    if action == 'list':
        return inactive
        
    if not inactive:
        return []
        
    results = []
    if action == 'move':
        older_dir = os.path.join(os.path.dirname(inactive[0]), "_older_projects")
        os.makedirs(older_dir, exist_ok=True)
        for p in inactive:
            dest = os.path.join(older_dir, os.path.basename(p))
            shutil.move(p, dest)
            results.append(f"Moved {p} to {dest}")
            
    elif action == 'zip':
        for p in inactive:
            zip_name = f"{p}_archived_{datetime.datetime.now().strftime('%Y%m%d')}.zip"
            shutil.make_archive(zip_name.replace('.zip',''), 'zip', p)
            shutil.rmtree(p)
            results.append(f"Zipped and deleted {p} -> {zip_name}")
            
    elif action == 'zip-all':
        parent_dir = os.path.dirname(inactive[0])
        zip_name = os.path.join(parent_dir, f"older_projects_{datetime.datetime.now().strftime('%Y%m%d')}.zip")
        with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zf:
            for p in inactive:
                for root, _, files in os.walk(p):
                    for f in files:
                        file_path = os.path.join(root, f)
                        zf.write(file_path, os.path.relpath(file_path, parent_dir))
        for p in inactive:
            shutil.rmtree(p)
        results.append(f"Zipped all inactive projects to {zip_name}")
        
    elif action == 'delete':
        if not confirm:
            return ["Delete aborted. --confirm flag required."]
        for p in inactive:
            shutil.rmtree(p)
            results.append(f"Permanently deleted {p}")
            
    return results

def build_diagnose(project_path):
    proj_name = os.path.basename(project_path)
    proj_backups = os.path.join(BACKUPS_DIR, proj_name)
    if not os.path.exists(proj_backups):
        return f"No backups found for {proj_name}. Cannot diagnose differences."
        
    latest_backup = sorted(os.listdir(proj_backups))[-1]
    target_backup_dir = os.path.join(proj_backups, latest_backup)
    
    diff_lines = []
    diff_lines.append(f"Diagnostic Info for {project_path}")
    diff_lines.append(f"Comparing current state with backup: {latest_backup}\n")
    
    for f in ['package.json', 'requirements.txt']:
        cur = os.path.join(project_path, f)
        bup = os.path.join(target_backup_dir, f)
        
        if os.path.exists(cur) and os.path.exists(bup):
            diff_lines.append(f"--- Differences for {f} ---")
            if f == 'package.json':
                with open(cur, 'r', encoding='utf-8') as fc, open(bup, 'r', encoding='utf-8') as fb:
                    cdata = json.load(fc).get('dependencies', {})
                    bdata = json.load(fb).get('dependencies', {})
                    for k,v in cdata.items():
                        bv = bdata.get(k)
                        if bv != v:
                            diff_lines.append(f"  {k}: Backup({bv}) vs Current({v})")
                            
            elif f == 'requirements.txt':
                with open(cur, 'r', encoding='utf-8') as fc, open(bup, 'r', encoding='utf-8') as fb:
                    clines = set(fc.read().splitlines())
                    blines = set(fb.read().splitlines())
                    for l in clines - blines:
                        diff_lines.append(f"+ {l}")
                    for l in blines - clines:
                        diff_lines.append(f"- {l}")
                        
    return "\n".join(diff_lines)
