package com.haps.backend.service;

import com.haps.backend.client.MLServiceClient;
import com.haps.backend.dto.PredictionRequestDto;
import com.haps.backend.dto.PredictionResponseDto;
import com.haps.backend.entity.PredictionRecord;
import com.haps.backend.exception.ResourceNotFoundException;
import com.haps.backend.repository.PredictionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final MLServiceClient mlServiceClient;

    public PredictionService(PredictionRepository predictionRepository, MLServiceClient mlServiceClient) {
        this.predictionRepository = predictionRepository;
        this.mlServiceClient = mlServiceClient;
    }

    @Transactional
    public PredictionResponseDto predictAndPersist(PredictionRequestDto requestDto) {
        Map<String, Object> features = requestDto.getFeatures();
        if (features == null || features.isEmpty()) {
            throw new IllegalArgumentException("Features payload cannot be empty");
        }

        Map<String, Object> mlResult = mlServiceClient.predict(features);

        Double probability = ((Number) mlResult.get("probability")).doubleValue();
        Integer label = ((Number) mlResult.get("label")).intValue();
        String riskLevel = (String) mlResult.get("riskLevel");
        String modelVersion = (String) mlResult.get("modelVersion");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> topFactors = (List<Map<String, Object>>) mlResult.get("topFactors");

        PredictionRecord entity = new PredictionRecord();
        entity.setInputFeatures(features);
        entity.setProbability(probability);
        entity.setLabel(label);
        entity.setRiskLevel(riskLevel);
        entity.setTopFactors(topFactors);
        entity.setModelVersion(modelVersion);

        PredictionRecord saved = predictionRepository.save(entity);

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<PredictionResponseDto> getPredictions(String riskLevel, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PredictionRecord> pageResult;
        if (riskLevel != null && !riskLevel.trim().isEmpty() && !riskLevel.equalsIgnoreCase("ALL")) {
            pageResult = predictionRepository.findByRiskLevelIgnoreCase(riskLevel.trim(), pageable);
        } else {
            pageResult = predictionRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return pageResult.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public PredictionResponseDto getPredictionById(Long id) {
        PredictionRecord record = predictionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prediction record not found with id: " + id));
        return toDto(record);
    }

    @Transactional
    public void deletePrediction(Long id) {
        if (!predictionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete: prediction record not found with id: " + id);
        }
        predictionRepository.deleteById(id);
    }

    private PredictionResponseDto toDto(PredictionRecord entity) {
        PredictionResponseDto dto = new PredictionResponseDto();
        dto.setId(entity.getId());
        dto.setInputFeatures(entity.getInputFeatures());
        dto.setProbability(entity.getProbability());
        dto.setLabel(entity.getLabel());
        dto.setRiskLevel(entity.getRiskLevel());
        dto.setTopFactors(entity.getTopFactors());
        dto.setModelVersion(entity.getModelVersion());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
