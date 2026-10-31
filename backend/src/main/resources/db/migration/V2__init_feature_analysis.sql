CREATE TABLE IF NOT EXISTS feature_analysis (
    id BIGSERIAL PRIMARY KEY,
    feature VARCHAR(100) NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    statistic DOUBLE PRECISION,
    p_value DOUBLE PRECISION,
    mutual_info DOUBLE PRECISION,
    permutation_importance DOUBLE PRECISION,
    fold_stability DOUBLE PRECISION,
    selected BOOLEAN NOT NULL DEFAULT FALSE,
    run_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feature_analysis_run_id ON feature_analysis(run_id);
CREATE INDEX IF NOT EXISTS idx_feature_analysis_selected ON feature_analysis(selected);
