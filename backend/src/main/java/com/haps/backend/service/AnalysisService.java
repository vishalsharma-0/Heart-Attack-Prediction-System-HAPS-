package com.haps.backend.service;

import com.haps.backend.entity.FeatureAnalysisRecord;
import com.haps.backend.repository.FeatureAnalysisRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AnalysisService {

    private final FeatureAnalysisRepository featureAnalysisRepository;

    public AnalysisService(FeatureAnalysisRepository featureAnalysisRepository) {
        this.featureAnalysisRepository = featureAnalysisRepository;
    }

    @Transactional(readOnly = true)
    public List<FeatureAnalysisRecord> getFeatureAnalysis() {
        return featureAnalysisRepository.findAllByOrderByMutualInfoDesc();
    }
}
