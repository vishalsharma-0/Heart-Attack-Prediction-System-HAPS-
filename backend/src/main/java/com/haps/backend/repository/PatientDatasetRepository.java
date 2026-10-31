package com.haps.backend.repository;

import com.haps.backend.entity.PatientRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public interface PatientDatasetRepository extends JpaRepository<PatientRecord, Long> {

    long countByTarget(Integer target);

    @Query(value = "SELECT " +
            "count(*) as total_count, " +
            "sum(case when target = 1 then 1 else 0 end) as target_positive, " +
            "sum(case when target = 0 then 1 else 0 end) as target_negative, " +
            "avg(age) as avg_age, " +
            "min(age) as min_age, " +
            "max(age) as max_age, " +
            "avg(trestbps) as avg_trestbps, " +
            "avg(chol) as avg_chol, " +
            "avg(thalach) as avg_thalach, " +
            "sum(case when sex = 1 then 1 else 0 end) as male_count, " +
            "sum(case when sex = 0 then 1 else 0 end) as female_count " +
            "FROM patients_dataset", nativeQuery = true)
    Map<String, Object> getDatasetSummaryStats();
}
