import requests
import os
from typing import Optional, Dict, Any
from diskcache import Cache

# Initialize a central cache for ForArch
CACHE_DIR = os.path.join(os.path.expanduser("~"), ".forarch_cache")
cache = Cache(CACHE_DIR)

class NPMRegistry:
    BASE_URL = "https://registry.npmjs.org"
    API_URL = "https://api.npmjs.org"

    def __init__(self):
        self.session = requests.Session()

    def get_package_info(self, package_name: str) -> Optional[Dict[str, Any]]:
        """Fetch package metadata from NPM with caching."""
        cache_key = f"npm:{package_name}"
        if cache_key in cache:
            return cache[cache_key]

        try:
            resp = self.session.get(f"{self.BASE_URL}/{package_name}", timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                cache.set(cache_key, data, expire=86400) # 24h cache
                return data
            return None
        except requests.RequestException:
            return None

    def get_weekly_downloads(self, package_name: str) -> int:
        """Fetch weekly download count with caching."""
        cache_key = f"npm_dl:{package_name}"
        if cache_key in cache:
            return cache[cache_key]

        try:
            resp = self.session.get(f"{self.API_URL}/downloads/point/last-week/{package_name}", timeout=5)
            if resp.status_code == 200:
                count = resp.json().get("downloads", 0)
                cache.set(cache_key, count, expire=86400)
                return count
            return 0
        except requests.RequestException:
            return 0

    def get_latest_version(self, pkg_info: Dict[str, Any]) -> str:
        dist_tags = pkg_info.get("dist-tags", {})
        return dist_tags.get("latest", "unknown")

    def is_deprecated(self, pkg_info: Dict[str, Any], version: str = None) -> str:
        if not version:
            version = self.get_latest_version(pkg_info)
        versions = pkg_info.get("versions", {})
        version_data = versions.get(version, {})
        return version_data.get("deprecated", "")

class PyPIRegistry:
    BASE_URL = "https://pypi.org/pypi"

    def __init__(self):
        self.session = requests.Session()

    def get_package_info(self, package_name: str) -> Optional[Dict[str, Any]]:
        """Fetch package metadata from PyPI with caching."""
        cache_key = f"pypi:{package_name}"
        if cache_key in cache:
            return cache[cache_key]

        try:
            resp = self.session.get(f"{self.BASE_URL}/{package_name}/json", timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                cache.set(cache_key, data, expire=86400)
                return data
            return None
        except requests.RequestException:
            return None

    def get_latest_version(self, pkg_info: Dict[str, Any]) -> str:
        return pkg_info.get("info", {}).get("version", "unknown")

    def is_deprecated(self, pkg_info: Dict[str, Any]) -> str:
        summary = pkg_info.get("info", {}).get("summary", "").lower()
        if "deprecated" in summary or "no longer maintained" in summary:
            return "Possible deprecation found in package summary."
        return ""

class MavenRegistry:
    BASE_URL = "https://search.maven.org/solrsearch/select"

    def __init__(self):
        self.session = requests.Session()

    def get_package_info(self, package_name: str) -> Optional[Dict[str, Any]]:
        """Fetch package metadata from Maven Central with caching."""
        cache_key = f"maven:{package_name}"
        if cache_key in cache:
            return cache[cache_key]

        if ":" not in package_name:
            return None
            
        group_id, artifact_id = package_name.split(":", 1)
        query = f"g:{group_id} AND a:{artifact_id}"
        try:
            resp = self.session.get(self.BASE_URL, params={"q": query, "wt": "json"}, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                docs = data.get("response", {}).get("docs", [])
                if docs:
                    cache.set(cache_key, docs[0], expire=86400)
                    return docs[0]
            return None
        except requests.RequestException:
            return None

    def get_latest_version(self, pkg_info: Dict[str, Any]) -> str:
        return pkg_info.get("latestVersion", "unknown")

    def is_deprecated(self, pkg_info: Dict[str, Any]) -> str:
        return ""

