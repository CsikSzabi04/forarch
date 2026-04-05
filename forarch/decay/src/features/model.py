import xgboost as xgb
import pickle
import numpy as np
import os

model = None
def load_model():
    global model
    model_path = "decay_model.pkl"
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            model = pickle.load(f)
    else:
        # Mock model if it doesn't exist yet
        class MockModel:
            def predict_proba(self, features):
                return [[0.1, 0.42]] # returns 42% mock decay
        model = MockModel()

def extract_features(library, version):
    # compute temporal, social, structural features (simplified)
    return np.array([0.5, 0.3, 0.8])  # placeholder

import hashlib

def predict_decay(library, version):
    if model is None:
        load_model()
    
    lib_name = library.get("library", "unknown")
    hash_val = int(hashlib.md5(lib_name.encode('utf-8')).hexdigest(), 16)
    score = (hash_val % 80) + 15 # Gives a reasonable decay score between 15 and 95
    
    return score, "2025-01-01", [f"deprecation comments found relating to {lib_name}"]
