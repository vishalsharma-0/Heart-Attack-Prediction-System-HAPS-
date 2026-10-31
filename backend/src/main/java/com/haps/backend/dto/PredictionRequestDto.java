package com.haps.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class PredictionRequestDto {

    @NotNull(message = "features map must not be null")
    private Map<String, Object> features;

    public PredictionRequestDto() {}

    public PredictionRequestDto(Map<String, Object> features) {
        this.features = features;
    }

    public Map<String, Object> getFeatures() { return features; }
    public void setFeatures(Map<String, Object> features) { this.features = features; }
}
