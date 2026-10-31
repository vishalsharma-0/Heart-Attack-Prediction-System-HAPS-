import os
import sys
import json
import yaml
import pandas as pd
from sqlalchemy import create_engine, text

def get_db_url(params):
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5433")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "postgres")
    db = os.getenv("DB_NAME", "haps")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}"

def main():
    params_path = os.path.join(os.path.dirname(__file__), "..", "..", "params.yaml")
    with open(params_path, "r", encoding="utf-8") as f:
        params = yaml.safe_load(f)

    db_url = get_db_url(params)
    print(f"[load_db] Connecting to database at {db_url}...")
    engine = create_engine(db_url)

    source_csv = params["data"]["source_csv"]
    if not os.path.isabs(source_csv):
        source_csv = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", source_csv))

    # Check database table
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT count(*) FROM patients_dataset;")).scalar()
            print(f"[load_db] Existing row count in patients_dataset: {result}")
    except Exception as e:
        print(f"[load_db] Table check notice: {e}. Checking CSV file...")
        result = 0

    if result != 3000:
        print(f"[load_db] Seeding database from {source_csv}...")
        df = pd.read_csv(source_csv)
        assert len(df) == 3000, f"Expected 3000 rows, found {len(df)}"
        df.to_sql("patients_dataset", engine, if_exists="append", index=False)
        print("[load_db] Seeded 3000 rows successfully.")

    # Read back and validate
    df = pd.read_sql("SELECT * FROM patients_dataset ORDER BY patient_id ASC;", engine)
    print(f"[load_db] Read {len(df)} rows from patients_dataset.")

    assert len(df) == 3000, f"Row count must be 3000, got {len(df)}"
    assert df.isnull().sum().sum() == 0, "No missing values allowed in dataset"

    # Summarize classes and distributions
    class_counts = df["target"].value_counts().to_dict()
    summary = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns": list(df.columns),
        "class_balance": {
            "negative_0": int(class_counts.get(0, 0)),
            "positive_1": int(class_counts.get(1, 0)),
            "negative_pct": round(float(class_counts.get(0, 0) / len(df) * 100), 2),
            "positive_pct": round(float(class_counts.get(1, 0) / len(df) * 100), 2)
        },
        "stats": {
            "age_mean": float(df["age"].mean()),
            "age_min": int(df["age"].min()),
            "age_max": int(df["age"].max()),
            "trestbps_mean": float(df["trestbps"].mean()),
            "chol_mean": float(df["chol"].mean()),
            "thalach_mean": float(df["thalach"].mean()),
            "male_count": int((df["sex"] == 1).sum()),
            "female_count": int((df["sex"] == 0).sum())
        }
    }

    artifacts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
    os.makedirs(artifacts_dir, exist_ok=True)
    summary_path = os.path.join(artifacts_dir, "dataset_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"[load_db] Dataset verified and summary written to {summary_path}")

if __name__ == "__main__":
    main()
