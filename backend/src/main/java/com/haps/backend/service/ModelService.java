package com.haps.backend.service;

import com.haps.backend.client.MLServiceClient;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ModelService {

    private final MLServiceClient mlServiceClient;

    public ModelService(MLServiceClient mlServiceClient) {
        this.mlServiceClient = mlServiceClient;
    }

    public Map<String, Object> getSchema() {
        return mlServiceClient.getSchema();
    }

    public Map<String, Object> getMetrics() {
        return mlServiceClient.getMetrics();
    }
}
