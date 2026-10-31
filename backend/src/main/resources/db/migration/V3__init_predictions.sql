CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    input_features JSONB NOT NULL,
    probability DOUBLE PRECISION NOT NULL,
    label INTEGER NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    top_factors JSONB NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predictions_risk_level ON predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
