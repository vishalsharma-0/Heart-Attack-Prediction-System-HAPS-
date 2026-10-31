package com.haps.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "predictions", indexes = {
    @Index(name = "idx_predictions_risk_level", columnList = "risk_level"),
    @Index(name = "idx_predictions_created_at", columnList = "created_at")
})
public class PredictionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_features", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> inputFeatures;

    @Column(nullable = false)
    private Double probability;

    @Column(nullable = false)
    private Integer label;

    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "top_factors", columnDefinition = "jsonb", nullable = false)
    private List<Map<String, Object>> topFactors;

    @Column(name = "model_version", nullable = false, length = 50)
    private String modelVersion;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public PredictionRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Map<String, Object> getInputFeatures() { return inputFeatures; }
    public void setInputFeatures(Map<String, Object> inputFeatures) { this.inputFeatures = inputFeatures; }

    public Double getProbability() { return probability; }
    public void setProbability(Double probability) { this.probability = probability; }

    public Integer getLabel() { return label; }
    public void setLabel(Integer label) { this.label = label; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public List<Map<String, Object>> getTopFactors() { return topFactors; }
    public void setTopFactors(List<Map<String, Object>> topFactors) { this.topFactors = topFactors; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
