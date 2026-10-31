package com.haps.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "patients_dataset", indexes = {
    @Index(name = "idx_patients_dataset_target", columnList = "target")
})
public class PatientRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Integer patientId;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private Integer sex;

    @Column(nullable = false)
    private Integer cp;

    @Column(nullable = false)
    private Integer trestbps;

    @Column(nullable = false)
    private Integer chol;

    @Column(nullable = false)
    private Integer fbs;

    @Column(nullable = false)
    private Integer restecg;

    @Column(nullable = false)
    private Integer thalach;

    @Column(nullable = false)
    private Integer exang;

    @Column(nullable = false)
    private Double oldpeak;

    @Column(nullable = false)
    private Integer slope;

    @Column(nullable = false)
    private Integer ca;

    @Column(nullable = false)
    private Integer thal;

    @Column(nullable = false)
    private Integer smoking;

    @Column(nullable = false)
    private Integer obesity;

    @Column(nullable = false)
    private Integer diabetes;

    @Column(nullable = false)
    private Integer hypertension;

    @Column(name = "family_history", nullable = false)
    private Integer familyHistory;

    @Column(name = "physical_activity", nullable = false)
    private Integer physicalActivity;

    @Column(name = "diet_quality", nullable = false)
    private Integer dietQuality;

    @Column(name = "alcohol_use", nullable = false)
    private Integer alcoholUse;

    @Column(name = "air_pollution_exposure", nullable = false)
    private Double airPollutionExposure;

    @Column(name = "chest_pain_severity", nullable = false)
    private Integer chestPainSeverity;

    @Column(nullable = false)
    private Integer target;

    public PatientRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Integer getSex() { return sex; }
    public void setSex(Integer sex) { this.sex = sex; }

    public Integer getCp() { return cp; }
    public void setCp(Integer cp) { this.cp = cp; }

    public Integer getTrestbps() { return trestbps; }
    public void setTrestbps(Integer trestbps) { this.trestbps = trestbps; }

    public Integer getChol() { return chol; }
    public void setChol(Integer chol) { this.chol = chol; }

    public Integer getFbs() { return fbs; }
    public void setFbs(Integer fbs) { this.fbs = fbs; }

    public Integer getRestecg() { return restecg; }
    public void setRestecg(Integer restecg) { this.restecg = restecg; }

    public Integer getThalach() { return thalach; }
    public void setThalach(Integer thalach) { this.thalach = thalach; }

    public Integer getExang() { return exang; }
    public void setExang(Integer exang) { this.exang = exang; }

    public Double getOldpeak() { return oldpeak; }
    public void setOldpeak(Double oldpeak) { this.oldpeak = oldpeak; }

    public Integer getSlope() { return slope; }
    public void setSlope(Integer slope) { this.slope = slope; }

    public Integer getCa() { return ca; }
    public void setCa(Integer ca) { this.ca = ca; }

    public Integer getThal() { return thal; }
    public void setThal(Integer thal) { this.thal = thal; }

    public Integer getSmoking() { return smoking; }
    public void setSmoking(Integer smoking) { this.smoking = smoking; }

    public Integer getObesity() { return obesity; }
    public void setObesity(Integer obesity) { this.obesity = obesity; }

    public Integer getDiabetes() { return diabetes; }
    public void setDiabetes(Integer diabetes) { this.diabetes = diabetes; }

    public Integer getHypertension() { return hypertension; }
    public void setHypertension(Integer hypertension) { this.hypertension = hypertension; }

    public Integer getFamilyHistory() { return familyHistory; }
    public void setFamilyHistory(Integer familyHistory) { this.familyHistory = familyHistory; }

    public Integer getPhysicalActivity() { return physicalActivity; }
    public void setPhysicalActivity(Integer physicalActivity) { this.physicalActivity = physicalActivity; }

    public Integer getDietQuality() { return dietQuality; }
    public void setDietQuality(Integer dietQuality) { this.dietQuality = dietQuality; }

    public Integer getAlcoholUse() { return alcoholUse; }
    public void setAlcoholUse(Integer alcoholUse) { this.alcoholUse = alcoholUse; }

    public Double getAirPollutionExposure() { return airPollutionExposure; }
    public void setAirPollutionExposure(Double airPollutionExposure) { this.airPollutionExposure = airPollutionExposure; }

    public Integer getChestPainSeverity() { return chestPainSeverity; }
    public void setChestPainSeverity(Integer chestPainSeverity) { this.chestPainSeverity = chestPainSeverity; }

    public Integer getTarget() { return target; }
    public void setTarget(Integer target) { this.target = target; }
}
