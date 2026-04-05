import os, time, shutil, zipfile
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
console = Console()
REPORTS_DIR = "reports"; SAVED_PATHS_FILE = "saved_Paths.txt"
def init_saved_paths(): pass
def get_saved_paths(): return []
def scan_path(*args, **kwargs): return "done", []
def collect_garbage(target_path):
    now = time.time(); days_90 = 90 * 24 * 60 * 60
    outdated_root = os.path.join(target_path, "Projects Outdated")
    archived = []
    with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console) as progress:
        scan_task = progress.add_task("Checking...")
        for root, dirs, files in os.walk(target_path):
            if any(f in ['package.json', 'requirements.txt'] for f in files):
                p_name = os.path.basename(root)
                progress.update(scan_task, description=f"Found {p_name}")
                archived.append(p_name)
    return archived