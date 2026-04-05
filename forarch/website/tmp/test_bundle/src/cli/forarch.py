import click
from src.cli.guardian import guardian
@click.group()
def cli(): pass
cli.add_command(guardian)
if __name__ == "__main__": cli()