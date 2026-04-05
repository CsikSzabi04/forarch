import re
import os
from typing import List, Dict

# Patterns for deprecated/rotten code in source files
# Each pattern has: regex, message, recommendation
DEPRECATED_PATTERNS = [
    {
        "regex": r"require\s*\(\s*['\"]request['\"]\s*\)",
        "message": "Deprecated 'request' library imported via require().",
        "recommendation": "Use 'axios' or built-in 'fetch' instead.",
        "extensions": [".js", ".ts", ".tsx"]
    },
    {
        "regex": r"from\s*['\"]request['\"]",
        "message": "Deprecated 'request' library imported via ESM.",
        "recommendation": "Use 'axios' or built-in 'fetch' instead.",
        "extensions": [".js", ".ts", ".tsx"]
    },
    {
        "regex": r"moment\s*\(",
        "message": "Legacy 'moment' library call detected.",
        "recommendation": "Use 'date-fns', 'luxon' or 'dayjs' for better performance and smaller bundle size.",
        "extensions": [".js", ".ts", ".tsx"]
    },
    {
        "regex": r"import\s+urllib",
        "message": "Legacy 'urllib' (std lib) usage detected.",
        "recommendation": "Consider 'requests' or 'urllib3' for a more modern API.",
        "extensions": [".py"]
    },
    {
        "regex": r"os\.path\.",
        "message": "Legacy 'os.path' usage detected.",
        "recommendation": "Consider using 'pathlib' for a more object-oriented approach.",
        "extensions": [".py"]
    },
    {
        "regex": r"System\.out\.println",
        "message": "Direct console logging in Java production code.",
        "recommendation": "Use a logging framework like SLF4J or Log4j2.",
        "extensions": [".java"]
    },
    {
        "regex": r"import\s+org\.apache\.log4j\.",
        "message": "Deprecated Log4j 1.x usage.",
        "recommendation": "Migrate to Log4j 2 or SLF4J.",
        "extensions": [".java"]
    }
]

def scan_file(file_path: str) -> List[Dict]:
    findings = []
    ext = os.path.splitext(file_path)[1]
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        for line_num, content in enumerate(lines, 1):
            for pattern in DEPRECATED_PATTERNS:
                if ext in pattern["extensions"]:
                    if re.search(pattern["regex"], content):
                        findings.append({
                            "file": file_path,
                            "line": line_num,
                            "message": pattern["message"],
                            "recommendation": pattern["recommendation"],
                            "content": content.strip()
                        })
    except Exception:
        pass
        
    return findings
