package com.haps.backend.controller;

import com.haps.backend.dto.PredictionRequestDto;
import com.haps.backend.dto.PredictionResponseDto;
import com.haps.backend.service.PredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Predictions", description = "Heart attack risk predictions management")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping({"/api/predict", "/api/predictions"})
    @Operation(summary = "Perform real-time heart attack risk prediction and persist record")
    public ResponseEntity<PredictionResponseDto> createPrediction(@Valid @RequestBody PredictionRequestDto requestDto) {
        PredictionResponseDto response = predictionService.predictAndPersist(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/predictions")
    @Operation(summary = "Get paginated prediction history with optional risk level filtering")
    public ResponseEntity<Page<PredictionResponseDto>> getPredictions(
            @RequestParam(required = false) String riskLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PredictionResponseDto> result = predictionService.getPredictions(riskLevel, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/predictions/{id}")
    @Operation(summary = "Get prediction details by ID")
    public ResponseEntity<PredictionResponseDto> getPredictionById(@PathVariable Long id) {
        PredictionResponseDto response = predictionService.getPredictionById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/predictions/{id}")
    @Operation(summary = "Delete prediction record by ID")
    public ResponseEntity<Void> deletePrediction(@PathVariable Long id) {
        predictionService.deletePrediction(id);
        return ResponseEntity.noContent().build();
    }
}
