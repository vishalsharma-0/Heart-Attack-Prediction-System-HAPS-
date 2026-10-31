package com.haps.backend.service;

import com.haps.backend.repository.PatientDatasetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class DatasetService {

    private final PatientDatasetRepository patientDatasetRepository;

    public DatasetService(PatientDatasetRepository patientDatasetRepository) {
        this.patientDatasetRepository = patientDatasetRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDatasetSummary() {
        return patientDatasetRepository.getDatasetSummaryStats();
    }
}
