from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from ..features.model import predict_decay
from ..db.models import get_library

app = FastAPI(title="ForArch Decay API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DecayRequest(BaseModel):
    ecosystem: str   # npm, pypi, crates
    library: str
    version: str

class DecayResponse(BaseModel):
    decay_score: float
    predicted_break_date: Optional[str] = None
    signals: list[str]

@app.post("/decay", response_model=DecayResponse)
async def decay_endpoint(req: DecayRequest):
    lib = get_library(req.ecosystem, req.library)
    if not lib:
        raise HTTPException(status_code=404, detail="Library not indexed yet")
    score, date, signals = predict_decay(lib, req.version)
    return {"decay_score": score, "predicted_break_date": date, "signals": signals}

@app.post("/witness/signature")  # for extension to upload anonymized fixes
async def receive_signature(sig: dict):
    # store in a separate table for future training
    return {"status": "ok"}
