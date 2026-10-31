package com.haps.backend.repository;

import com.haps.backend.entity.FeatureAnalysisRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeatureAnalysisRepository extends JpaRepository<FeatureAnalysisRecord, Long> {
    List<FeatureAnalysisRecord> findByRunId(String runId);
    List<FeatureAnalysisRecord> findAllByOrderByMutualInfoDesc();
}
