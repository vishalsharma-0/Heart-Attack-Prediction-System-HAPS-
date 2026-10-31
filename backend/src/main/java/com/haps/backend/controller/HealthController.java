package com.haps.backend.controller;

import com.haps.backend.client.MLServiceClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "System health check and downstream services status")
public class HealthController {

    private final MLServiceClient mlServiceClient;

    public HealthController(MLServiceClient mlServiceClient) {
        this.mlServiceClient = mlServiceClient;
    }

    @GetMapping
    @Operation(summary = "Overall health check for Spring Boot and downstream ML service")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("backendService", "HAPS Spring Boot API Gateway");
        health.put("version", "1.0.0");

        try {
            Map<String, Object> mlHealth = mlServiceClient.getHealth();
            health.put("mlServiceStatus", "UP");
            health.put("mlDetails", mlHealth);
        } catch (Exception e) {
            health.put("mlServiceStatus", "DOWN");
            health.put("mlError", e.getMessage());
        }

        return ResponseEntity.ok(health);
    }
}
