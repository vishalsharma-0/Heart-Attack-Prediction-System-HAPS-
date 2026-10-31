package com.haps.backend.controller;

import com.haps.backend.service.DatasetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dataset")
@Tag(name = "Dataset", description = "Training dataset summary and statistics")
public class DatasetController {

    private final DatasetService datasetService;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get dataset row count, class balance, and clinical distributions directly from PostgreSQL")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(datasetService.getDatasetSummary());
    }
}
