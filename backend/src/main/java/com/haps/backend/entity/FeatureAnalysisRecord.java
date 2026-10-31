package com.haps.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "feature_analysis")
public class FeatureAnalysisRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String feature;

    @Column(name = "test_name", nullable = false, length = 100)
    private String testName;

    private Double statistic;

    @Column(name = "p_value")
    private Double pValue;

    @Column(name = "mutual_info")
    private Double mutualInfo;

    @Column(name = "permutation_importance")
    private Double permutationImportance;

    @Column(name = "fold_stability")
    private Double foldStability;

    @Column(nullable = false)
    private Boolean selected = false;

    @Column(name = "run_id", nullable = false, length = 100)
    private String runId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public FeatureAnalysisRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFeature() { return feature; }
    public void setFeature(String feature) { this.feature = feature; }

    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }

    public Double getStatistic() { return statistic; }
    public void setStatistic(Double statistic) { this.statistic = statistic; }

    public Double getPValue() { return pValue; }
    public void setPValue(Double pValue) { this.pValue = pValue; }

    public Double getMutualInfo() { return mutualInfo; }
    public void setMutualInfo(Double mutualInfo) { this.mutualInfo = mutualInfo; }

    public Double getPermutationImportance() { return permutationImportance; }
    public void setPermutationImportance(Double permutationImportance) { this.permutationImportance = permutationImportance; }

    public Double getFoldStability() { return foldStability; }
    public void setFoldStability(Double foldStability) { this.foldStability = foldStability; }

    public Boolean getSelected() { return selected; }
    public void setSelected(Boolean selected) { this.selected = selected; }

    public String getRunId() { return runId; }
    public void setRunId(String runId) { this.runId = runId; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
