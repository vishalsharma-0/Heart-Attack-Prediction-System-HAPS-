package com.haps.backend.controller;

import com.haps.backend.service.ModelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/model")
@Tag(name = "Model", description = "Machine learning model schema, versions, and evaluation metrics")
public class ModelController {

    private final ModelService modelService;

    public ModelController(ModelService modelService) {
        this.modelService = modelService;
    }

    @GetMapping("/schema")
    @Operation(summary = "Get dynamic schema and clinical range metadata for current model version")
    public ResponseEntity<Map<String, Object>> getSchema() {
        return ResponseEntity.ok(modelService.getSchema());
    }

    @GetMapping("/metrics")
    @Operation(summary = "Get comparative benchmark metrics, ROC points, confusion matrix, and feature importances")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(modelService.getMetrics());
    }
}
