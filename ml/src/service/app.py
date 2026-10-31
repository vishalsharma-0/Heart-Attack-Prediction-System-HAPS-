import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, create_model, Field

# Load artifacts
artifacts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
model_path = os.path.join(artifacts_dir, "model.joblib")
meta_path = os.path.join(artifacts_dir, "metadata.json")
explainer_path = os.path.join(artifacts_dir, "explainer.joblib")

if not os.path.exists(model_path) or not os.path.exists(meta_path):
    raise RuntimeError(f"Model or metadata missing at {artifacts_dir}. Run pipeline first.")

pipeline = joblib.load(model_path)
with open(meta_path, "r", encoding="utf-8") as f:
    metadata = json.load(f)

explainer = None
if os.path.exists(explainer_path):
    try:
        explainer = joblib.load(explainer_path)
    except Exception as e:
        print(f"[service] Warning: Could not load SHAP explainer: {e}")

selected_features = metadata["selected_features"]
tuned_threshold = metadata["tuned_threshold"]
model_version = metadata["model_version"]
feature_metadata = metadata.get("feature_metadata", {})

app = FastAPI(
    title="Heart Attack Prediction System (HAPS) - Inference Service",
    description="Production ML service with dynamic schema validation and SHAP explanations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Friendly UI descriptions and grouping following UCI Cleveland standards
FEATURE_DESCRIPTIONS = {
    "age": {"label": "Age", "unit": "years", "group": "Demographics", "hint": "Patient age in years (30–80)"},
    "sex": {
        "label": "Sex", "group": "Demographics", "hint": "Biological sex",
        "options": [{"value": 1, "label": "Male"}, {"value": 0, "label": "Female"}]
    },
    "cp": {
        "label": "Chest Pain Type (cp)", "group": "Symptoms", "hint": "Clinical presentation of chest discomfort",
        "options": [
            {"value": 0, "label": "Typical Angina (Type 0)"},
            {"value": 1, "label": "Atypical Angina (Type 1)"},
            {"value": 2, "label": "Non-Anginal Pain (Type 2)"},
            {"value": 3, "label": "Asymptomatic (Type 3)"}
        ]
    },
    "trestbps": {"label": "Resting Blood Pressure (trestbps)", "unit": "mm Hg", "group": "Cardiac Tests", "hint": "Resting systolic blood pressure upon admission (90–180)"},
    "chol": {"label": "Serum Cholesterol (chol)", "unit": "mg/dl", "group": "Cardiac Tests", "hint": "Serum cholesterol level (150–300)"},
    "fbs": {
        "label": "Fasting Blood Sugar (fbs)", "group": "Cardiac Tests", "hint": "Blood sugar after overnight fasting",
        "options": [{"value": 1, "label": "Fasting Blood Sugar > 120 mg/dl"}, {"value": 0, "label": "Fasting Blood Sugar ≤ 120 mg/dl"}]
    },
    "restecg": {
        "label": "Resting Electrocardiographic Results (restecg)", "group": "Cardiac Tests", "hint": "Baseline ECG characteristics",
        "options": [
            {"value": 0, "label": "Normal (Type 0)"},
            {"value": 1, "label": "ST-T Wave Abnormality (Type 1)"},
            {"value": 2, "label": "Left Ventricular Hypertrophy (Type 2)"}
        ]
    },
    "thalach": {"label": "Maximum Heart Rate Achieved (thalach)", "unit": "bpm", "group": "Cardiac Tests", "hint": "Maximum heart rate recorded during exercise (80–200)"},
    "exang": {
        "label": "Exercise Induced Angina (exang)", "group": "Symptoms", "hint": "Angina provoked by exertion",
        "options": [{"value": 1, "label": "Yes (Induced)"}, {"value": 0, "label": "No (Absent)"}]
    },
    "oldpeak": {"label": "ST Depression (oldpeak)", "unit": "mm", "group": "Cardiac Tests", "hint": "ST depression induced by exercise relative to rest (0.0–6.0)"},
    "slope": {
        "label": "Slope of Peak Exercise ST Segment (slope)", "group": "Cardiac Tests", "hint": "Slope trend on ECG",
        "options": [
            {"value": 0, "label": "Upsloping (Type 0)"},
            {"value": 1, "label": "Flat (Type 1)"},
            {"value": 2, "label": "Downsloping (Type 2)"}
        ]
    },
    "ca": {
        "label": "Number of Major Vessels Colored (ca)", "group": "Cardiac Tests", "hint": "Fluoroscopy visible vessels (0–3)",
        "options": [
            {"value": 0, "label": "0 vessels"},
            {"value": 1, "label": "1 vessel"},
            {"value": 2, "label": "2 vessels"},
            {"value": 3, "label": "3 vessels"}
        ]
    },
    "thal": {
        "label": "Thalassemia (thal)", "group": "Cardiac Tests", "hint": "Thallium cardiac scintigraphy status",
        "options": [
            {"value": 1, "label": "Type 1 (Normal blood flow)"},
            {"value": 2, "label": "Type 2 (Fixed defect / non-reversible)"},
            {"value": 3, "label": "Type 3 (Reversible defect)"}
        ]
    },
    # Candidate extras if ever selected
    "smoking": {"label": "Smoking Status", "group": "Lifestyle", "options": [{"value": 1, "label": "Smoker"}, {"value": 0, "label": "Non-Smoker"}]},
    "obesity": {"label": "Obesity", "group": "Lifestyle", "options": [{"value": 1, "label": "Yes"}, {"value": 0, "label": "No"}]},
    "diabetes": {"label": "Diabetes Mellitus", "group": "Medical History", "options": [{"value": 1, "label": "Diabetic"}, {"value": 0, "label": "Non-Diabetic"}]},
    "hypertension": {"label": "Hypertension", "group": "Medical History", "options": [{"value": 1, "label": "Hypertensive"}, {"value": 0, "label": "Normotensive"}]},
    "family_history": {"label": "Family History of CAD", "group": "Medical History", "options": [{"value": 1, "label": "Present"}, {"value": 0, "label": "None"}]},
    "physical_activity": {"label": "Physical Activity Level", "group": "Lifestyle", "options": [{"value": 0, "label": "Sedentary"}, {"value": 1, "label": "Moderate"}, {"value": 2, "label": "Active"}]},
    "diet_quality": {"label": "Diet Quality", "group": "Lifestyle", "options": [{"value": 0, "label": "Poor"}, {"value": 1, "label": "Average"}, {"value": 2, "label": "Healthy"}]},
    "alcohol_use": {"label": "Alcohol Consumption", "group": "Lifestyle", "options": [{"value": 0, "label": "Never/Rare"}, {"value": 1, "label": "Moderate"}, {"value": 2, "label": "Heavy"}]},
    "air_pollution_exposure": {"label": "Air Pollution Exposure", "unit": "AQI/Index", "group": "Environmental"},
    "chest_pain_severity": {"label": "Chest Pain Severity Scale", "unit": "1-10", "group": "Symptoms"}
}

def build_schema_definitions():
    schema_list = []
    for feat in selected_features:
        f_meta = feature_metadata.get(feat, {})
        ui_meta = FEATURE_DESCRIPTIONS.get(feat, {"label": feat, "group": "Clinical Measurements"})
        item = {
            "name": feat,
            "label": ui_meta.get("label", feat),
            "group": ui_meta.get("group", "General"),
            "unit": ui_meta.get("unit"),
            "hint": ui_meta.get("hint"),
            "type": f_meta.get("type", "float"),
            "min": f_meta.get("min"),
            "max": f_meta.get("max"),
            "defaultValue": f_meta.get("median", f_meta.get("mean")),
            "options": ui_meta.get("options")
        }
        schema_list.append(item)
    return schema_list

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "HAPS ML Inference Service",
        "model_version": model_version,
        "algorithm": metadata["algorithm"],
        "num_features": len(selected_features),
        "is_model_loaded": pipeline is not None,
        "tuned_threshold": tuned_threshold
    }

@app.get("/schema")
def get_schema():
    return {
        "modelVersion": model_version,
        "algorithm": metadata["algorithm"],
        "tunedThreshold": tuned_threshold,
        "selectedFeatures": selected_features,
        "featureCount": len(selected_features),
        "schema": build_schema_definitions()
    }

@app.get("/metrics")
def get_metrics():
    return {
        "modelVersion": model_version,
        "algorithm": metadata["algorithm"],
        "tunedThreshold": tuned_threshold,
        "selectedModelMetrics": metadata.get("selected_model_metrics", {}),
        "allModelsComparison": metadata.get("all_models_comparison", {}),
        "confusionMatrix": metadata.get("confusion_matrix", []),
        "rocPoints": metadata.get("roc_points", []),
        "featureImportances": metadata.get("feature_importances", {}),
        "honestyDisclaimer": metadata.get("honesty_disclaimer", "")
    }

class PredictionRequest(BaseModel):
    features: Dict[str, Any]

@app.post("/predict")
def predict_heart_attack_risk(request: PredictionRequest):
    input_dict = request.features

    # Validate all required features are present
    missing = [f for f in selected_features if f not in input_dict]
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing required features: {missing}")

    # Validate ranges and build vector
    vector = []
    for f in selected_features:
        val = input_dict[f]
        try:
            val_num = float(val)
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail=f"Feature '{f}' must be a numeric value, got '{val}'")

        f_meta = feature_metadata.get(f)
        if f_meta:
            min_v = f_meta.get("min")
            max_v = f_meta.get("max")
            # Tolerant bounds (within 20% margin of historical dataset ranges)
            if min_v is not None and val_num < (min_v * 0.8 if min_v > 0 else min_v * 1.2):
                raise HTTPException(status_code=422, detail=f"Feature '{f}' value {val_num} is below clinical lower limit {min_v}")
            if max_v is not None and val_num > (max_v * 1.2):
                raise HTTPException(status_code=422, detail=f"Feature '{f}' value {val_num} exceeds clinical upper limit {max_v}")

        vector.append(val_num)

    X_in = np.array([vector])

    # Probability prediction from pipeline
    try:
        probs = pipeline.predict_proba(X_in)[0]
        prob_positive = float(probs[1])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference pipeline execution failed: {str(e)}")

    # Decision rule
    label = 1 if prob_positive >= tuned_threshold else 0

    # Risk level classification
    if prob_positive >= tuned_threshold:
        risk_level = "High"
    elif prob_positive >= max(0.0, tuned_threshold - 0.10):
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    # SHAP Explanations
    top_factors = []
    try:
        if explainer is not None:
            # Scaler transform for explainer if tree
            scaler = pipeline.named_steps.get("scaler")
            if scaler is not None:
                scaled_x = scaler.transform(X_in)
            else:
                scaled_x = X_in

            try:
                shap_values = explainer.shap_values(scaled_x)
            except Exception:
                shap_values = explainer(scaled_x)

            # Handle multi-class output or explanation object
            if hasattr(shap_values, "values"):
                sv = shap_values.values
            else:
                sv = shap_values

            if isinstance(sv, list) and len(sv) == 2:
                # Class 1 shap values
                sv_arr = sv[1][0]
            elif isinstance(sv, np.ndarray) and sv.ndim == 3:
                sv_arr = sv[0, :, 1]
            elif isinstance(sv, np.ndarray) and sv.ndim == 2:
                sv_arr = sv[0]
            else:
                sv_arr = np.array(sv).flatten()[:len(selected_features)]

            # Rank by absolute magnitude
            indexed_shap = []
            for i, feat_name in enumerate(selected_features):
                impact_val = float(sv_arr[i]) if i < len(sv_arr) else 0.0
                indexed_shap.append({
                    "feature": feat_name,
                    "label": FEATURE_DESCRIPTIONS.get(feat_name, {}).get("label", feat_name),
                    "value": vector[i],
                    "impact": round(float(abs(impact_val)), 4),
                    "raw_shap": round(impact_val, 4),
                    "direction": "increases_risk" if impact_val > 0 else "decreases_risk"
                })

            indexed_shap.sort(key=lambda x: x["impact"], reverse=True)
            top_factors = indexed_shap[:5]
    except Exception as e:
        print(f"[service] Warning: SHAP computation fallback: {e}")

    # Fallback if SHAP was not computed
    if not top_factors:
        clf_step = pipeline.named_steps.get("clf")
        importances = getattr(clf_step, "feature_importances_", None)
        if importances is not None:
            indexed_imp = []
            for i, feat_name in enumerate(selected_features):
                indexed_imp.append({
                    "feature": feat_name,
                    "label": FEATURE_DESCRIPTIONS.get(feat_name, {}).get("label", feat_name),
                    "value": vector[i],
                    "impact": round(float(importances[i]), 4),
                    "direction": "increases_risk" if prob_positive >= tuned_threshold else "decreases_risk"
                })
            indexed_imp.sort(key=lambda x: x["impact"], reverse=True)
            top_factors = indexed_imp[:5]

    return {
        "probability": round(prob_positive, 4),
        "label": label,
        "riskLevel": risk_level,
        "topFactors": top_factors,
        "modelVersion": model_version,
        "tunedThreshold": tuned_threshold
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
