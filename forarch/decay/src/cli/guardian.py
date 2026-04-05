import click
import os
import sys
from rich.console import Console
from rich.panel import Panel

from src.features.guardian_core import (
    scan_path, save_watchlist, get_watchlist, do_updates, rollback, process_inactive, build_diagnose,
    GUARDIAN_DIR, REPORTS_DIR
)
from src.analyzer.registry import NPMRegistry, PyPIRegistry, MavenRegistry
from src.features.remote_hub import intercept_execution

# Global console instance will be re-initialized if needed
console = Console()

@click.group()
def guardian():
    """Environment & Project Guardian - Teljeskörű projekt és környezet felügyelet."""
    pass

@guardian.command()
def scan():
    """Interactive scan options"""
    intercept_execution()
    global console
    console = Console() # Refresh console to use the now-redirected stdout
    
    from src.features.guardian_core import init_saved_paths, get_saved_paths, SAVED_PATHS_FILE
    init_saved_paths()
    console.print(Panel("[bold brand]ForArch Guardian CLI[/]", border_style="brand"))
    console.print("Mit szeretnél szkennelni?")
    console.print("  [brand]1.[/] Locale Disk (Csak nagy/fő könyvtárak - max 3 mélység)")
    console.print("  [brand]2.[/] Locale Disk All (Minden kis mappa is, mély keresés)")
    console.print("  [brand]3.[/] Folder (Konkrét mappa megadása)")
    console.print(f"  [brand]4.[/] Saved (A '{SAVED_PATHS_FILE}' fájl alapján)")
    
    choice = click.prompt("Válassz", type=click.Choice(['1', '2', '3', '4']))
    
    targets = []
    max_depth = None
    
    if choice == '1':
        if sys.platform == 'win32': targets = ['C:\\', 'D:\\']
        else: targets = ['/home', '/var']
        console.print("[info]-> Locale Disk Scan (max depth 3)[/]")
        max_depth = 3
    elif choice == '2':
        if sys.platform == 'win32': targets = ['C:\\', 'D:\\']
        else: targets = ['/home', '/var']
        console.print("[info]-> Locale Disk All (Deep Scan)[/]")
        max_depth = None
    elif choice == '3':
        folder = click.prompt("Add meg a folder útvonalát (be is illesztheted)")
        targets = [folder]
        max_depth = None
    elif choice == '4':
        paths = get_saved_paths()
        if not paths:
            console.print(f"[warning]A {SAVED_PATHS_FILE} üres vagy nem található érvényes útvonal. Töltsd ki mielőtt ezt a módot használod.[/]")
            return
        targets = paths
        max_depth = None

    npm_reg, pypi_reg, maven_reg = NPMRegistry(), PyPIRegistry(), MavenRegistry()
    
    all_reports = []
    total_projects = 0
    for target in targets:
        if os.path.exists(target):
            console.print(f"\n[info]Scanning {target} ...[/]")
            report, projects = scan_path(target, npm_reg, pypi_reg, maven_reg, single_project=False, max_depth=max_depth)
            all_reports.append(report)
            total_projects += len(projects)
        else:
            console.print(f"[warning]Path not found: {target}[/]")
            
    if not all_reports:
        return
        
    final_report = "\n\n".join(all_reports)
    report_file = os.path.join(REPORTS_DIR, "forarch_scan_report.txt")
    with open(report_file, "w", encoding="utf-8") as f:
        f.write(final_report)
        
    console.print(final_report)
    console.print(Panel(f"[success]Scan Complete![/]\nFound {total_projects} projects.\nDetailed report saved to {report_file}", border_style="success"))


@guardian.command()
@click.option('--save', is_flag=True, help="Elmenti a watchlist-et")
@click.option('--run', is_flag=True, help="Lefuttatja a watchlist-ben lévő projektek vizsgálatát")
def watch(save, run):
    """Manage watchlist for continuous project supervision."""
    if save:
        # Save current directory to watchlist (or you can pipe them, but we'll use CWD as example if no arg provided)
        cwd = os.getcwd()
        paths = save_watchlist([cwd])
        console.print(f"[success]Watchlist updated![/] Now tracking {len(paths)} projects:")
        for p in paths:
            console.print(f"  - {p}")
            
    if run:
        paths = get_watchlist()
        if not paths:
            console.print("[warning]Watchlist is empty. Run watch --save first.[/]")
            return
            
        npm_reg, pypi_reg, maven_reg = NPMRegistry(), PyPIRegistry(), MavenRegistry()
        console.print(f"[info]Running watch scan on {len(paths)} projects...[/]")
        
        summary = []
        for p in paths:
            report, _ = scan_path(p, npm_reg, pypi_reg, maven_reg, single_project=True)
            out_file = os.path.join(REPORTS_DIR, f"{os.path.basename(p)}_outdated.txt")
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(report)
            summary.append(f"{p} -> {out_file}")
            
        sum_file = os.path.join(REPORTS_DIR, "watchlist_summary.txt")
        with open(sum_file, "w", encoding="utf-8") as f:
            f.write("\n".join(summary))
            
        console.print(f"[success]Watch scan completed![/] Summary saved to {sum_file}")

@guardian.command()
@click.option('--dry-run', is_flag=True, help="Megmutatja a függőségi frissítéseket")
@click.option('--apply', is_flag=True, help="Végrehajtja a frissítéseket biztonsági mentéssel")
def update(dry_run, apply):
    """Update dependencies for current project or watchlist."""
    if not dry_run and not apply:
        console.print("[warning]Please specify --dry-run or --apply.[/]")
        return
        
    cwd = os.getcwd()
    console.print(f"[info]Applying updates to {cwd}...[/]")
    result = do_updates(cwd, dry_run=not apply)
    console.print(result)

@guardian.command(name='rollback')
@click.option('--project', required=True, help="Projekt útvonala")
@click.option('--date', required=True, help="Dátum YYYY-MM-DD formátumban")
def rollback_cmd(project, date):
    """Restore manifest files from backup."""
    result = rollback(os.path.abspath(project), date)
    console.print(result)

@guardian.command()
@click.option('--move', is_flag=True, help="Régi projektek áthelyezése")
@click.option('--zip', is_flag=True, help="Régi projektek tömörítése egyesével")
@click.option('--zip-all', is_flag=True, help="Összes régi projekt zip-elése")
@click.option('--older-than', default=365, help="Hány napnál régebbi projekteket érint (alap: 365)")
def archive(move, zip, zip_all, older_than):
    """Archive old inactive projects."""
    if move: action = 'move'
    elif zip: action = 'zip'
    elif zip_all: action = 'zip-all'
    else:
        console.print("[warning]Please specify --move, --zip, or --zip-all.[/]")
        return
        
    res = process_inactive(older_than, action)
    if not res:
        console.print(f"[info]No projects older than {older_than} days found.[/]")
    else:
        for r in res: console.print(f"[success]{r}[/]")

@guardian.command()
@click.option('--older-than', default=365, help="Hány napnál régebbi projekteket érint")
@click.option('--confirm', is_flag=True, help="Megerősítés a végleges törléshez")
def delete_inactive(older_than, confirm):
    """Permanently delete inactive projects."""
    res = process_inactive(older_than, 'delete', confirm=confirm)
    for r in res:
        console.print(r)

@guardian.command()
@click.option('--older-than', default=365, help="Hány napnál régebbi projekteket érint")
def list_inactive(older_than):
    """List inactive projects."""
    res = process_inactive(older_than, 'list')
    if not res:
        console.print(f"[info]No projects older than {older_than} days found in watchlist.[/]")
    else:
        console.print(f"[warning]Found {len(res)} inactive projects:[/]")
        for r in res: console.print(f"  - {r}")

@guardian.command()
@click.option('--project', required=True, help="Projekt útvonala")
def diagnose(project):
    """Compare project tree to last working backup after failure."""
    res = build_diagnose(os.path.abspath(project))
    console.print(res)

@guardian.command()
@click.option('--daily', help="Napi ütemezés, pl. 08:00")
@click.option('--weekly', help="Heti ütemezés napja és órája, pl. 'Monday 08:00'")
def schedule(daily, weekly):
    """Schedule ForArch guardian tasks."""
    if sys.platform == 'win32':
        console.print("[info]Windows Task Scheduler Setup[/]")
        if daily:
            cmd = f'schtasks /create /tn "ForArch_Daily" /tr "forarch guardian watch --run" /sc daily /st {daily}'
            console.print("To setup daily scan, run this as Administrator:\n" + f"[brand]{cmd}[/]")
    else:
        console.print("[info]Cron Job Setup[/]")
        if daily:
            hm = daily.split(':')
            if len(hm) == 2:
                cmd = f'{hm[1]} {hm[0]} * * * /path/to/forarch guardian watch --run'
                console.print(f"Add this to your crontab:\n[brand]{cmd}[/]")
                
    console.print("\n[success]Schedule instructions generated.[/]")
