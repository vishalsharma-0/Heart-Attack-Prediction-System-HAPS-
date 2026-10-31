package com.haps.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.haps.backend.client.MLServiceClient;
import com.haps.backend.dto.PredictionRequestDto;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PredictionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MLServiceClient mlServiceClient;

    @Test
    public void testHealthEndpoint() throws Exception {
        Mockito.when(mlServiceClient.getHealth()).thenReturn(Map.of("status", "UP", "algorithm", "CatBoost"));

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.mlServiceStatus").value("UP"));
    }

    @Test
    public void testCreatePredictionSuccess() throws Exception {
        Map<String, Object> input = new java.util.HashMap<>();
        input.put("age", 60);
        input.put("sex", 1);
        input.put("cp", 2);
        input.put("trestbps", 140);
        input.put("chol", 240);
        input.put("fbs", 0);
        input.put("restecg", 1);
        input.put("thalach", 150);
        input.put("exang", 0);
        input.put("oldpeak", 1.5);
        input.put("slope", 1);
        input.put("ca", 0);
        input.put("thal", 2);

        Map<String, Object> mockMlResponse = Map.of(
                "probability", 0.68,
                "label", 1,
                "riskLevel", "High",
                "modelVersion", "HAPS-v1.0-CatBoost",
                "topFactors", List.of(
                        Map.of("feature", "thalach", "impact", 0.15, "direction", "decreases_risk"),
                        Map.of("feature", "oldpeak", "impact", 0.12, "direction", "increases_risk")
                )
        );

        Mockito.when(mlServiceClient.predict(Mockito.anyMap())).thenReturn(mockMlResponse);

        PredictionRequestDto requestDto = new PredictionRequestDto(input);

        mockMvc.perform(post("/api/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.probability").value(0.68))
                .andExpect(jsonPath("$.riskLevel").value("High"))
                .andExpect(jsonPath("$.modelVersion").value("HAPS-v1.0-CatBoost"))
                .andExpect(jsonPath("$.topFactors", hasSize(2)));
    }

    @Test
    public void testGetPredictionsPagination() throws Exception {
        mockMvc.perform(get("/api/predictions?page=0&size=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    public void testGetDatasetSummary() throws Exception {
        mockMvc.perform(get("/api/dataset/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total_count").value(3000));
    }

    @Test
    public void testGetAnalysisFeatures() throws Exception {
        mockMvc.perform(get("/api/analysis/features"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
