from github import Github
import aiohttp
import asyncio

g = Github("your_token")

def get_commits(repo_name: str, since_date: str):
    repo = g.get_repo(repo_name)
    commits = repo.get_commits(since=since_date)
    return [{"sha": c.sha, "message": c.commit.message, "date": c.commit.author.date} for c in commits]
