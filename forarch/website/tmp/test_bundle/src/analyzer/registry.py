import requests
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
    def get_latest_version(self, i): return "1.0.0"