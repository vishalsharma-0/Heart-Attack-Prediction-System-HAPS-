package com.haps.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public class PredictionResponseDto {

    private Long id;
    private Map<String, Object> inputFeatures;
    private Double probability;
    private Integer label;
    private String riskLevel;
    private List<Map<String, Object>> topFactors;
    private String modelVersion;
    private OffsetDateTime createdAt;

    public PredictionResponseDto() {}

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
