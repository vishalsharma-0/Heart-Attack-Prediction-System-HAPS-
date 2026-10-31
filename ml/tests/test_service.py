import pytest
from fastapi.testclient import TestClient
import sys, os

# Add ml/src/service to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src", "service")))
from app import app, selected_features

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert "model_version" in data
    assert data["is_model_loaded"] is True

def test_schema_endpoint():
    response = client.get("/schema")
    assert response.status_code == 200
    data = response.json()
    assert "schema" in data
    assert data["featureCount"] == len(selected_features)
    assert len(data["schema"]) == len(selected_features)

def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "allModelsComparison" in data
    assert "confusionMatrix" in data
    assert "rocPoints" in data
    assert "honestyDisclaimer" in data

def test_predict_endpoint_valid_sample():
    # Construct a valid clinical sample
    sample = {
        "age": 60,
        "sex": 1,
        "cp": 2,
        "trestbps": 140,
        "chol": 240,
        "fbs": 0,
        "restecg": 1,
        "thalach": 150,
        "exang": 0,
        "oldpeak": 1.5,
        "slope": 1,
        "ca": 0,
        "thal": 2
    }
    response = client.post("/predict", json={"features": sample})
    assert response.status_code == 200
    res = response.json()
    assert "probability" in res
    assert "label" in res
    assert res["riskLevel"] in ["High", "Moderate", "Low"]
    assert "topFactors" in res
    assert len(res["topFactors"]) <= 5
    assert res["topFactors"][0]["direction"] in ["increases_risk", "decreases_risk"]

def test_predict_endpoint_missing_feature():
    sample = {"age": 55}
    response = client.post("/predict", json={"features": sample})
    assert response.status_code == 422
