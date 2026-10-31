# CardioGuard — Heart Health Check

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.143.0-blue.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2F18-blue.svg)](https://www.postgresql.org/)
[![DVC](https://img.shields.io/badge/DVC-Data%20Version%20Control-9cf.svg)](https://dvc.org/)
[![MLflow](https://img.shields.io/badge/MLflow-Tracking-0194E2.svg)](https://mlflow.org/)

**Public Cardiovascular Screening & Preventive Decision Support Platform**  
Empowering individuals and clinicians with instant, transparent risk stratification.

---

## 1. Project Overview & Clinical Context
Cardiovascular diseases (CVDs) remain the leading cause of death globally (~19.8 million annual deaths), with sudden heart attacks contributing significantly. In routine practice, physicians must manually correlate 10+ borderline indicators under diagnostic fatigue.

The **Heart Attack Prediction System (HAPS)** delivers an end-to-end clinical decision-support platform that:
1. Employs a strict **13-feature baseline** from UCI Cleveland clinical conventions.
2. Performs automated **factor testing** ($\chi^2$, Mann-Whitney U, Mutual Information, and 5-fold CV Permutation Importance) stored in PostgreSQL.
3. Benchmarks 5 ML algorithms (**Logistic Regression, Random Forest, SVM, XGBoost, and CatBoost**) tracked via **MLflow**.
4. Prioritizes clinical **Recall** (mitigating missed at-risk patients) via **$F_2$-score decision threshold tuning**.
5. Computes individual **SHAP TreeExplainer** feature attributions showing exactly which biomarkers elevate or reduce a patient's risk.

### Academic Honesty & Empirical Integrity
Unlike theoretical works reporting synthetic $\ge 99\%$ accuracy via test-set contamination or synthetic oversampling, this project strictly adheres to empirical integrity. In this 3,000-patient cohort (`heart_attack_india_3000.csv`), the underlying statistical signal is realistically reported (~0.54 ROC-AUC, 99.6% recall under tuned clinical threshold $T=0.300$). All metrics displayed in the user interface reflect actual trained models and real PostgreSQL rows.

---

## 2. Architecture & Data Flow

```
+---------------------------------------------------------------------------------------+
|                                    USER BROWSER                                       |
|                  React 18 + Vite + Plain CSS + Recharts (Port 5173)                   |
+-------------------------------------------+-------------------------------------------+
                                            |
                                 REST API (JSON via HTTP)
                                            v
+---------------------------------------------------------------------------------------+
|                                  API GATEWAY (backend/)                               |
|                  Spring Boot 3.3.4, Java 17, Spring Data JPA, Flyway                   |
|                                       Port 8080                                       |
+---------------------+-------------------------------------+---------------------------+
                      |                                     |
               Direct SQL Queries                  HTTP Proxy Inference
                      v                                     v
+-------------------------------------+   +---------------------------------------------+
|          DATABASE (Postgres)        |   |             ML ENGINE (ml/)                 |
|            Port 5432 / 5433         |   |    Python 3.13, FastAPI (Port 8000)         |
|  Tables:                            |   |    Models: CatBoost, XGBoost, RF, SVM, LR   |
|  - patients_dataset (3,000 rows)    |<--|    Pipeline: DVC, MLflow, SHAP TreeExplainer|
|  - feature_analysis (Factor tests)  |   +---------------------------------------------+
|  - predictions (JSONB records)      |
+-------------------------------------+
```

---

## 3. Quick Start

### Option A: Local Run on Windows (Recommended for Development)
Prerequisites: Python 3.11+, Java 17+, Node.js 18+.

1. Run the all-in-one startup script:
   ```powershell
   .\start-all.ps1
   ```
   Or double-click `start-all.bat`.

2. The script will:
   - Verify/launch the dedicated PostgreSQL instance (`localhost:5433`, database `haps`, user `postgres`).
   - Launch the FastAPI inference microservice (`http://localhost:8000`).
   - Launch the Spring Boot 3 API (`http://localhost:8080`).
   - Launch the React 18 dashboard (`http://localhost:5173`) and open your browser automatically.

To stop all services:
```powershell
.\stop-all.ps1
```

### Option B: Docker Compose
```bash
docker compose up --build
```
This starts PostgreSQL 16, ML FastAPI, Spring Boot 3, and React 18 in healthcheck dependency order. The dataset automatically seeds 3,000 rows on first launch.

---

## 4. Endpoints & API Reference

All requests pass through the Spring Boot API Gateway (`http://localhost:8080`):

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/predict` | Validates features, calls ML service, saves record, returns risk & SHAP |
| `GET` | `/api/predictions?page=0&size=10&riskLevel=High` | Paginated prediction audit log |
| `GET` | `/api/predictions/{id}` | Retrieve individual prediction record |
| `DELETE` | `/api/predictions/{id}` | Delete prediction record |
| `GET` | `/api/model/schema` | Dynamic schema, ranges, and clinical groupings |
| `GET` | `/api/model/metrics` | 5-model benchmark metrics, ROC points, confusion matrix |
| `GET` | `/api/dataset/summary` | Row count (3,000), class balance, and demographic distributions |
| `GET` | `/api/analysis/features` | Statistical factor tests from `feature_analysis` |
| `GET` | `/api/health` | Gateway & downstream ML service health status |

### Example Prediction Request (`curl`)
```bash
curl -X POST http://localhost:8080/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "age": 62,
      "sex": 1,
      "cp": 0,
      "trestbps": 140,
      "chol": 250,
      "fbs": 1,
      "restecg": 1,
      "thalach": 130,
      "exang": 1,
      "oldpeak": 2.4,
      "slope": 1,
      "ca": 2,
      "thal": 3
    }
  }'
```

### Example Prediction Response
```json
{
  "id": 1,
  "inputFeatures": { "age": 62, "sex": 1, "cp": 0, "trestbps": 140, "chol": 250, ... },
  "probability": 0.4729,
  "label": 1,
  "riskLevel": "High",
  "topFactors": [
    { "feature": "age", "label": "Age", "value": 62.0, "impact": 0.083, "direction": "decreases_risk" },
    { "feature": "sex", "label": "Sex", "value": 1.0, "impact": 0.0668, "direction": "increases_risk" },
    { "feature": "cp", "label": "Chest Pain Type", "value": 0.0, "impact": 0.0584, "direction": "decreases_risk" },
    { "feature": "slope", "label": "ST Slope", "value": 1.0, "impact": 0.0549, "direction": "decreases_risk" },
    { "feature": "thalach", "label": "Max Heart Rate", "value": 130.0, "impact": 0.0541, "direction": "increases_risk" }
  ],
  "modelVersion": "HAPS-v1.0-CatBoost",
  "createdAt": "2026-10-13T04:10:43.443Z"
}
```

---

## 5. ML Pipeline & Experiment Tracking

The ML pipeline is managed via **DVC** and tracked with **MLflow**:

### Reproduce Full Pipeline
```bash
ml\.venv\Scripts\dvc.exe repro
```
Stages executed in order:
1. `load_db`: Validates connection and verifies 3,000 rows in `patients_dataset`.
2. `analyze_features`: Runs hypothesis testing, mutual info, and the $\Delta \text{ROC-AUC} > 0.01$ selection gate; persists rows to `feature_analysis`.
3. `train`: 5-fold stratified CV across 5 algorithms, $F_2$ threshold optimization, SHAP explainer fitting, and MLflow logging.
4. `evaluate`: Generates verification report and metrics tables.

### Launch MLflow UI
```bash
ml\.venv\Scripts\mlflow.exe ui --backend-store-uri file:///c:/Users/visha/Downloads/HAPS(final)/ml/mlruns --port 5000
```
Open [http://localhost:5000](http://localhost:5000) to inspect logged runs, ROC curves, hyperparameters, and confusion matrices.

---

## 6. Database Schema (Flyway Migrations)

Spring Boot owns the schema migrations located in `backend/src/main/resources/db/migration/`:
- `V1__init_patients_dataset.sql`: `patients_dataset` with all 25 CSV attributes + `id`, with index on `target`.
- `V2__init_feature_analysis.sql`: `feature_analysis` recording `feature`, `test_name`, `statistic`, `p_value`, `mutual_info`, `permutation_importance`, `fold_stability`, `selected`, `run_id`.
- `V3__init_predictions.sql`: `predictions` recording `id`, `input_features` (JSONB), `probability`, `label`, `risk_level`, `top_factors` (JSONB), `model_version`, `created_at`.

---

## 7. Running Tests

### 1. Python ML Service Tests (`pytest`)
```bash
ml\.venv\Scripts\pytest.exe ml\tests
```
Verifies `/health`, `/schema`, `/metrics`, and `/predict` with range bounds and validation checks.

### 2. Spring Boot Integration Tests (`JUnit 5 + MockMvc`)
```bash
cd backend
.\mvnw.cmd test
```
Verifies controllers, JPA repositories, Flyway migrations, and mocked ML client communication.

### 3. Frontend Form Validation Tests (`Vitest`)
```bash
cd frontend
npx vitest run
```
Verifies range checking, missing attribute handling, and numerical boundaries.

---

## 8. Clinical Disclaimer & Public Notice

CardioGuard is designed as an educational cardiovascular screening and risk stratification aid. It is not an FDA-cleared diagnostic device and should never replace consultation with a licensed cardiologist or emergency healthcare provider.

