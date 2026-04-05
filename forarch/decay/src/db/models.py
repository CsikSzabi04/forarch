MOCK_LIBS = [
    ("npm", "lodash"),
    ("npm", "react"),
    ("npm", "axios"),
    ("npm", "express"),
    ("npm", "vue"),
    ("npm", "tailwindcss"),
    ("npm", "vite"),
    ("pypi", "requests"),
    ("pypi", "fastapi"),
    ("crates", "tokio")
]

def get_library(ecosystem: str, library: str):
    if (ecosystem, library) in MOCK_LIBS:
        return {"ecosystem": ecosystem, "library": library, "indexed_commits": 120}
    return None
