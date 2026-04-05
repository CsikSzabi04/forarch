import os
import shutil

# Reset src
if os.path.exists('src'):
    shutil.rmtree('src')
os.makedirs('src/cli', exist_ok=True)
os.makedirs('src/analyzer', exist_ok=True)
os.makedirs('src/features', exist_ok=True)

# Markers
for d in ['src', 'src/cli', 'src/analyzer', 'src/features']:
    with open(os.path.join(d, '__init__.py'), 'w') as f: f.write('')

# Registry (Needed for forarch.py)
with open('src/analyzer/registry.py', 'w', encoding='utf-8') as f:
    f.write(r'''import requests
from typing import Optional, Dict, Any
class NPMRegistry:
    BASE_URL = "https://registry.npmjs.org"; API_URL = "https://api.npmjs.org"
    def get_package_info(self, p): return None
    def get_latest_version(self, i): return "1.0.0"
class PyPIRegistry:
    BASE_URL = "https://pypi.org/pypi"
    def get_package_info(self, p): return None
    def get_latest_version(self, i): return "1.0.0"
class MavenRegistry:
    BASE_URL = "https://search.maven.org/solrsearch/select"
    def get_package_info(self, p): return None
    def get_latest_version(self, i): return "1.0.0"''')

# Static Analyzer
with open('src/analyzer/static_analyzer.py', 'w', encoding='utf-8') as f:
    f.write('def scan_file(f): return []')

# Report Generator
with open('src/analyzer/report_generator.py', 'w', encoding='utf-8') as f:
    f.write('def generate_report(f, s): return "report.txt"')

# guardian_core.py
with open('src/features/guardian_core.py', 'w', encoding='utf-8') as f:
    f.write(r'''import os, time, shutil, zipfile
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
    return archived''')

# guardian.py
with open('src/cli/guardian.py', 'w', encoding='utf-8') as f:
    f.write(r'''import click
from src.features.guardian_core import scan_path, collect_garbage, init_saved_paths, get_saved_paths
@click.group()
def guardian(): pass
@guardian.command()
def scan(): print("Guardian CLI Started (English)")''')

# forarch.py
with open('src/cli/forarch.py', 'w', encoding='utf-8') as f:
    f.write(r'''import click
from src.cli.guardian import guardian
@click.group()
def cli(): pass
cli.add_command(guardian)
if __name__ == "__main__": cli()''')
