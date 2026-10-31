package com.haps.backend.repository;

import com.haps.backend.entity.PredictionRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PredictionRepository extends JpaRepository<PredictionRecord, Long> {
    Page<PredictionRecord> findByRiskLevelIgnoreCase(String riskLevel, Pageable pageable);
    Page<PredictionRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
