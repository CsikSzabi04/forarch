from typing import Optional

# Hand-curated mappings (for the prototype)
# Maps deprecated/obsolete libraries to modern alternatives.
RECOMMENDATIONS_DB = {
    "request": "axios",
    "request-promise": "axios",
    "moment": "date-fns",
    "tslint": "eslint",
    "jade": "pug",
    "body-parser": "express (built-in)",
    "phantomjs": "puppeteer",
    "node-sass": "sass",
    "faker": "@faker-js/faker"
}

def get_recommendation(library_name: str) -> Optional[str]:
    """Returns a direct alternative if the library is known to be historically obsolete."""
    return RECOMMENDATIONS_DB.get(library_name.lower())
