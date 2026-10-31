package com.haps.backend.controller;

import com.haps.backend.entity.FeatureAnalysisRecord;
import com.haps.backend.service.AnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@Tag(name = "Analysis", description = "Statistical feature factor analysis and selection records")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @GetMapping("/features")
    @Operation(summary = "Get factor testing results (chi-square, mutual information, permutation importance) from PostgreSQL")
    public ResponseEntity<List<FeatureAnalysisRecord>> getFeatureAnalysis() {
        return ResponseEntity.ok(analysisService.getFeatureAnalysis());
    }
}
