import json
import os
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, fbeta_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from catboost import CatBoostClassifier

def tune_threshold(y_true, y_prob, beta=2.0):
    best_thresh = 0.5
    best_fbeta = -1.0
    for thresh in np.linspace(0.1, 0.9, 81):
        preds = (y_prob >= thresh).astype(int)
        score = fbeta_score(y_true, preds, beta=beta, zero_division=0)
        if score > best_fbeta:
            best_fbeta = score
            best_thresh = thresh
    return float(np.round(best_thresh, 2))

def run_benchmark():
    df = pd.read_csv("data/raw/heart_cleveland_303.csv")
    X = df.drop(columns=["target"])
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    models = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42),
        "SVM": SVC(probability=True, random_state=42),
        "XGBoost": XGBClassifier(n_estimators=100, max_depth=3, learning_rate=0.05, random_state=42, eval_metric="logloss"),
        "CatBoost": CatBoostClassifier(iterations=150, depth=4, learning_rate=0.05, random_seed=42, verbose=0)
    }

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = {}

    for name, clf in models.items():
        pipe = Pipeline([
            ("scaler", StandardScaler()),
            ("clf", clf)
        ])

        cv_accs, cv_precs, cv_recs, cv_f1s, cv_aucs = [], [], [], [], []
        cv_val_probs, cv_val_trues = [], []

        for train_idx, val_idx in skf.split(X_train, y_train):
            X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
            y_tr, y_val = y_train.iloc[train_idx], y_train.iloc[val_idx]

            pipe.fit(X_tr, y_tr)
            probs = pipe.predict_proba(X_val)[:, 1]
            preds = (probs >= 0.5).astype(int)

            cv_accs.append(accuracy_score(y_val, preds))
            cv_precs.append(precision_score(y_val, preds, zero_division=0))
            cv_recs.append(recall_score(y_val, preds, zero_division=0))
            cv_f1s.append(f1_score(y_val, preds, zero_division=0))
            cv_aucs.append(roc_auc_score(y_val, probs))

            cv_val_probs.extend(probs)
            cv_val_trues.extend(y_val)

        # Tune threshold on OOF CV probabilities
        tuned_thresh = tune_threshold(np.array(cv_val_trues), np.array(cv_val_probs), beta=2.0)

        # Retrain on full training set
        pipe.fit(X_train, y_train)
        test_probs = pipe.predict_proba(X_test)[:, 1]
        test_preds = (test_probs >= tuned_thresh).astype(int)

        results[name] = {
            "name": name,
            "tuned_threshold": tuned_thresh,
            "cv_accuracy_mean": float(np.mean(cv_accs)),
            "cv_accuracy_std": float(np.std(cv_accs)),
            "cv_precision_mean": float(np.mean(cv_precs)),
            "cv_precision_std": float(np.std(cv_precs)),
            "cv_recall_mean": float(np.mean(cv_recs)),
            "cv_recall_std": float(np.std(cv_recs)),
            "cv_f1_mean": float(np.mean(cv_f1s)),
            "cv_f1_std": float(np.std(cv_f1s)),
            "cv_roc_auc_mean": float(np.mean(cv_aucs)),
            "cv_roc_auc_std": float(np.std(cv_aucs)),
            "test_accuracy": float(accuracy_score(y_test, test_preds)),
            "test_precision": float(precision_score(y_test, test_preds, zero_division=0)),
            "test_recall": float(recall_score(y_test, test_preds, zero_division=0)),
            "test_f1": float(f1_score(y_test, test_preds, zero_division=0)),
            "test_roc_auc": float(roc_auc_score(y_test, test_probs))
        }

    os.makedirs("ml/artifacts", exist_ok=True)
    with open("ml/artifacts/uci_metrics_comparison.json", "w") as f:
        json.dump(results, f, indent=2)

    print("UCI Benchmark Completed Successfully!")
    for k, v in results.items():
        print(f"{k:20s}: Test Acc={v['test_accuracy']:.4f}, Test Recall={v['test_recall']:.4f}, Test ROC-AUC={v['test_roc_auc']:.4f}, Tuned Thresh={v['tuned_threshold']}")

if __name__ == "__main__":
    run_benchmark()
