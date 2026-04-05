import os
from datetime import datetime
from typing import List, Dict

REPORT_DIR = "Analysy text file room"

def generate_report(findings: List[Dict], summary: Dict, output_dir: str = "Analysy text file room"):
    output_dir = os.path.normpath(output_dir)
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
    except:
        pass
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = os.path.join(output_dir, f"archaeology_report_{timestamp}.txt")
    
    try:
        with open(report_file, "w", encoding="utf-8") as f:
            f.write("=========================================\n")
            f.write("      FORECAST ARCHAEOLOGY ENGINE\n")
            f.write("      DEEP SCAN DIAGNOSTIC REPORT\n")
            f.write("=========================================\n\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Total files scanned: {summary.get('files_scanned', 0)}\n")
            f.write(f"Total issues found: {len(findings)}\n\n")
            if not findings:
                f.write("No software decay or legacy patterns found in source code.\n")
            else:
                f.write("DETAIL FINDINGS:\n")
                f.write("----------------\n")
                for index, finding in enumerate(findings, 1):
                    f.write(f"{index}. FILE: {finding['file']}\n")
                    f.write(f"   LINE: {finding['line']}\n")
                    f.write(f"   ISSUE: {finding['message']}\n")
                    f.write(f"   CODE: {finding['content']}\n")
                    f.write(f"   RECOMMENDATION: {finding['recommendation']}\n")
                    f.write("\n")
            f.write("\n=========================================\n")
            f.write("      END OF ARCHAEOLOGY REPORT\n")
            f.write("=========================================\n")
        return report_file
    except Exception as e:
        print(f"\n[!] Could not save report: {e}")
        return None

def generate_fix_script(updates_by_path: Dict[str, Dict[str, str]], output_dir: str = "Analysy text file room"):
    """Generates a .bat file to automate library upgrades."""
    output_dir = os.path.normpath(output_dir)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    fix_name = f"run_upgrades_{timestamp}.bat"
    fix_file = os.path.join(output_dir, fix_name)
    
    content = "@echo off\n"
    content += "echo =========================================\n"
    content += "echo      FORARCH AUTO-UPGRADE SCRIPT\n"
    content += "echo =========================================\n\n"
    
    for path, updates in updates_by_path.items():
        dir_path = os.path.dirname(os.path.abspath(path))
        is_npm = path.endswith('package.json')
        is_pypi = path.endswith('requirements.txt')
        content += f"echo Updating artifacts in: {dir_path}\n"
        content += f"cd /d \"{dir_path}\"\n"
        if is_npm:
            update_str = " ".join([f"{lib}@{ver}" for lib, ver in updates.items()])
            content += f"call npm install {update_str}\n"
        elif is_pypi:
            update_str = " ".join([f"{lib}=={ver}" for lib, ver in updates.items()])
            content += f"call pip install --upgrade {update_str}\n"
        else: # Maven
            content += f"call mvn dependency:update\n"
        content += "echo -----------------------------------------\n\n"
    content += "echo Upgrades completed!\n"
    content += "pause\n"

    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
        with open(fix_file, "w", encoding="utf-8") as f:
            f.write(content)
        return fix_file
    except PermissionError:
        # Fallback to project root
        fallback_file = os.path.join(os.getcwd(), fix_name)
        try:
            with open(fallback_file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"\n[!] Permission denied in {output_dir}. Saved fix script to root: {fallback_file}")
            return fallback_file
        except Exception as e:
            print(f"\n[!] CRITICAL: Could not create fix script anywhere: {e}")
            return None
    except Exception as e:
        print(f"\n[!] Error creating fix script: {e}")
        return None

bitumen_status = "OK" # Placeholder for consistency
