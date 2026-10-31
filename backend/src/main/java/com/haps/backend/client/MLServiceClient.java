package com.haps.backend.client;

import com.haps.backend.exception.MLServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class MLServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MLServiceClient.class);

    private final RestClient restClient;
    private final String mlServiceUrl;

    public MLServiceClient(RestClient restClient,
                           @Value("${haps.ml.service-url:http://localhost:8000}") String mlServiceUrl) {
        this.restClient = restClient;
        this.mlServiceUrl = mlServiceUrl;
    }

    public Map<String, Object> getHealth() {
        try {
            return restClient.get()
                    .uri(mlServiceUrl + "/health")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch ML service health: {}", e.getMessage());
            throw new MLServiceUnavailableException("ML service health check failed: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> getSchema() {
        try {
            return restClient.get()
                    .uri(mlServiceUrl + "/schema")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch ML schema: {}", e.getMessage());
            throw new MLServiceUnavailableException("ML service schema unavailable: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> getMetrics() {
        try {
            return restClient.get()
                    .uri(mlServiceUrl + "/metrics")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch ML metrics: {}", e.getMessage());
            throw new MLServiceUnavailableException("ML service metrics unavailable: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> predict(Map<String, Object> features) {
        try {
            Map<String, Object> payload = Map.of("features", features);
            return restClient.post()
                    .uri(mlServiceUrl + "/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Inference call to ML service failed: {}", e.getMessage());
            throw new MLServiceUnavailableException("Inference call failed: " + e.getMessage(), e);
        }
    }
}
