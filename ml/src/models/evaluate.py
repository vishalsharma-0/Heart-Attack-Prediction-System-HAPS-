import os
import json

def main():
    artifacts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
    meta_path = os.path.join(artifacts_dir, "metadata.json")

    if not os.path.exists(meta_path):
        print(f"[evaluate] Error: {meta_path} does not exist.")
        return

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    print("\n" + "="*80)
    print("      HEART ATTACK PREDICTION SYSTEM (HAPS) - EVALUATION SUMMARY")
    print("="*80)
    print(f"Model Version     : {meta['model_version']}")
    print(f"Selected Algorithm: {meta['algorithm']}")
    print(f"Feature Count     : {meta['feature_count']} features: {', '.join(meta['selected_features'])}")
    print(f"Tuned Threshold   : {meta['tuned_threshold']}")
    print(f"Git Revision      : {meta['git_revision']}")
    print("-"*80)
    print(f"{'Model':<20} | {'Test Recall':<12} | {'Test ROC-AUC':<12} | {'Test F1':<10} | {'Test Acc':<10}")
    print("-"*80)

    for m_name, metrics in meta["all_models_comparison"].items():
        marker = " (SELECTED)" if m_name == meta["algorithm"] else ""
        print(f"{m_name + marker:<20} | {metrics['test_recall']:<12.4f} | {metrics['test_roc_auc']:<12.4f} | {metrics['test_f1']:<10.4f} | {metrics['test_accuracy']:<10.4f}")

    print("="*80)
    print(meta["honesty_disclaimer"])
    print("="*80 + "\n")

    report_path = os.path.join(artifacts_dir, "evaluation_report.txt")
    with open(report_path, "w", encoding="utf-8") as out:
        out.write(f"HAPS Evaluation Report\n")
        out.write(f"Algorithm: {meta['algorithm']}\n")
        out.write(f"Features ({meta['feature_count']}): {', '.join(meta['selected_features'])}\n")
        out.write(f"Threshold: {meta['tuned_threshold']}\n")
        out.write(f"Metrics: {json.dumps(meta['selected_model_metrics'], indent=2)}\n")
        out.write(f"\nAll Models Comparison:\n{json.dumps(meta['all_models_comparison'], indent=2)}\n")
        out.write(f"\n{meta['honesty_disclaimer']}\n")
    print(f"[evaluate] Report saved to {report_path}")

if __name__ == "__main__":
    main()
