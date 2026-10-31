import os
import sys
import json
import uuid
import datetime
import yaml
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.model_selection import StratifiedKFold, train_test_split, cross_val_score
from sklearn.feature_selection import mutual_info_classif
from sklearn.inspection import permutation_importance
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sqlalchemy import create_engine, text

def get_db_url():
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

    seed = params["base"]["random_state"]
    test_size = params["base"]["test_size"]
    cv_folds = params["base"]["cv_folds"]
    min_delta = params["features"]["min_roc_auc_delta"]

    baseline_features = params["features"]["baseline_features"]
    candidate_extras = params["features"]["candidate_extras"]
    target_col = params["features"]["target_column"]

    db_url = get_db_url()
    print(f"[analyze] Reading dataset from database ({db_url})...")
    engine = create_engine(db_url)
    df = pd.read_sql("SELECT * FROM patients_dataset ORDER BY patient_id ASC;", engine)

    # Drop patient_id
    if "patient_id" in df.columns:
        df = df.drop(columns=["patient_id"])
    if "id" in df.columns:
        df = df.drop(columns=["id"])

    # Stratified 80/20 train/test split. All feature selection runs ONLY on train split!
    train_df, test_df = train_test_split(
        df, test_size=test_size, stratify=df[target_col], random_state=seed
    )
    print(f"[analyze] Train set: {len(train_df)} rows, Test set: {len(test_df)} rows")

    y_train = train_df[target_col].values
    all_feature_cols = [c for c in train_df.columns if c != target_col]

    continuous_features = {"age", "trestbps", "chol", "thalach", "oldpeak", "air_pollution_exposure"}

    # 1. Univariate Statistical Tests
    univariate_stats = {}
    for col in all_feature_cols:
        if col in continuous_features:
            g0 = train_df[train_df[target_col] == 0][col].values
            g1 = train_df[train_df[target_col] == 1][col].values
            u_stat, p_val = stats.mannwhitneyu(g0, g1, alternative="two-sided")
            univariate_stats[col] = {
                "test_name": "Mann-Whitney U",
                "statistic": float(u_stat),
                "p_value": float(p_val)
            }
        else:
            contingency = pd.crosstab(train_df[col], train_df[target_col])
            chi2, p_val, dof, _ = stats.chi2_contingency(contingency)
            univariate_stats[col] = {
                "test_name": "Chi-Square",
                "statistic": float(chi2),
                "p_value": float(p_val)
            }

    # 2. Mutual Information
    X_train_all = train_df[all_feature_cols].values
    mi_scores = mutual_info_classif(X_train_all, y_train, random_state=seed)
    mi_dict = {col: float(score) for col, score in zip(all_feature_cols, mi_scores)}

    # 3. Permutation Importance & Fold Stability on Train Split
    skf = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=seed)
    perm_importances = {col: [] for col in all_feature_cols}

    for fold, (t_idx, v_idx) in enumerate(skf.split(X_train_all, y_train)):
        fold_X_tr, fold_y_tr = X_train_all[t_idx], y_train[t_idx]
        fold_X_val, fold_y_val = X_train_all[v_idx], y_train[v_idx]

        pipe = Pipeline([
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(n_estimators=100, random_state=seed + fold, max_depth=5))
        ])
        pipe.fit(fold_X_tr, fold_y_tr)
        perm = permutation_importance(pipe, fold_X_val, fold_y_val, n_repeats=5, random_state=seed, scoring="roc_auc")
        for i, col in enumerate(all_feature_cols):
            perm_importances[col].append(perm.importances_mean[i])

    perm_importance_mean = {col: float(np.mean(vals)) for col, vals in perm_importances.items()}
    fold_stability = {col: float(np.mean([1 if v > 0 else 0 for v in vals])) for col, vals in perm_importances.items()}

    # 4. Feature Selection: Evaluate Baseline 13 vs Extras
    print("[analyze] Evaluating 13-feature baseline CV ROC-AUC...")
    X_train_base = train_df[baseline_features].values
    base_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(random_state=seed, max_iter=1000))
    ])
    baseline_cv_scores = cross_val_score(base_pipe, X_train_base, y_train, cv=skf, scoring="roc_auc")
    baseline_roc_auc = float(np.mean(baseline_cv_scores))
    print(f"[analyze] Baseline (13 features) CV ROC-AUC: {baseline_roc_auc:.4f}")

    # Test candidate extras
    best_single_extra = None
    best_single_auc = baseline_roc_auc
    candidate_deltas = {}

    for extra in candidate_extras:
        candidate_cols = baseline_features + [extra]
        pipe_cand = Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(random_state=seed, max_iter=1000))
        ])
        cand_scores = cross_val_score(pipe_cand, train_df[candidate_cols].values, y_train, cv=skf, scoring="roc_auc")
        cand_auc = float(np.mean(cand_scores))
        delta = cand_auc - baseline_roc_auc
        candidate_deltas[extra] = delta
        print(f"[analyze] Testing +{extra}: CV ROC-AUC={cand_auc:.4f} (delta={delta:+.4f})")
        if cand_auc > best_single_auc:
            best_single_auc = cand_auc
            best_single_extra = extra

    added_extras = []
    # Check if best candidate improves by > min_delta (0.01)
    if best_single_extra and (best_single_auc - baseline_roc_auc) > min_delta:
        added_extras.append(best_single_extra)
        print(f"[analyze] Candidate {best_single_extra} meets threshold with delta {best_single_auc - baseline_roc_auc:.4f}!")

        # Try adding a second extra
        best_pair_extra = None
        best_pair_auc = best_single_auc
        for extra in candidate_extras:
            if extra == best_single_extra:
                continue
            pair_cols = baseline_features + [best_single_extra, extra]
            pipe_pair = Pipeline([
                ("scaler", StandardScaler()),
                ("clf", LogisticRegression(random_state=seed, max_iter=1000))
            ])
            pair_scores = cross_val_score(pipe_pair, train_df[pair_cols].values, y_train, cv=skf, scoring="roc_auc")
            pair_auc = float(np.mean(pair_scores))
            if (pair_auc - best_single_auc) > min_delta and pair_auc > best_pair_auc:
                best_pair_auc = pair_auc
                best_pair_extra = extra
        if best_pair_extra:
            added_extras.append(best_pair_extra)
            print(f"[analyze] Second candidate {best_pair_extra} added with pair AUC {best_pair_auc:.4f}!")
    else:
        print(f"[analyze] No candidate extra improved CV ROC-AUC by > {min_delta:.2f}. Retaining baseline 13 features.")

    final_selected_features = baseline_features + added_extras
    print(f"[analyze] Final feature count: {len(final_selected_features)} features: {final_selected_features}")

    # 5. Write every tested feature's results to PostgreSQL feature_analysis table
    run_id = f"run_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
    created_at = datetime.datetime.now(datetime.timezone.utc)

    analysis_records = []
    for col in all_feature_cols:
        is_selected = (col in final_selected_features)
        record = {
            "feature": col,
            "test_name": univariate_stats[col]["test_name"],
            "statistic": univariate_stats[col]["statistic"],
            "p_value": univariate_stats[col]["p_value"],
            "mutual_info": mi_dict[col],
            "permutation_importance": perm_importance_mean[col],
            "fold_stability": fold_stability[col],
            "selected": is_selected,
            "run_id": run_id,
            "created_at": created_at.isoformat()
        }
        analysis_records.append(record)

    analysis_df = pd.DataFrame(analysis_records)
    analysis_df.to_sql("feature_analysis", engine, if_exists="append", index=False)
    print(f"[analyze] Logged {len(analysis_df)} feature factor tests to database table 'feature_analysis' (run_id: {run_id}).")

    # 6. Save artifacts
    artifacts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
    os.makedirs(artifacts_dir, exist_ok=True)
    out_selection_path = os.path.join(artifacts_dir, "selected_features.json")

    selection_metadata = {
        "run_id": run_id,
        "baseline_features": baseline_features,
        "candidate_extras": candidate_extras,
        "added_extras": added_extras,
        "selected_features": final_selected_features,
        "feature_count": len(final_selected_features),
        "baseline_cv_roc_auc": baseline_roc_auc,
        "selected_cv_roc_auc": best_single_auc if added_extras else baseline_roc_auc,
        "min_delta_threshold": min_delta,
        "factor_results": analysis_records
    }
    with open(out_selection_path, "w", encoding="utf-8") as f:
        json.dump(selection_metadata, f, indent=2)

    print(f"[analyze] Selected features artifact written to {out_selection_path}")

if __name__ == "__main__":
    main()
