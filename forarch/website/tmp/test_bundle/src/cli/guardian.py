import click
from src.features.guardian_core import scan_path, collect_garbage, init_saved_paths, get_saved_paths
@click.group()
def guardian(): pass
@guardian.command()
def scan(): print("Guardian CLI Started (English)")