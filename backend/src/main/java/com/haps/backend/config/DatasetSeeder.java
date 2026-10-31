package com.haps.backend.config;

import com.haps.backend.entity.PatientRecord;
import com.haps.backend.repository.PatientDatasetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatasetSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatasetSeeder.class);

    private final PatientDatasetRepository patientDatasetRepository;

    @Value("${haps.dataset.csv-path:../data/raw/heart_attack_india_3000.csv}")
    private String csvPath;

    public DatasetSeeder(PatientDatasetRepository patientDatasetRepository) {
        this.patientDatasetRepository = patientDatasetRepository;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        long currentCount = patientDatasetRepository.count();
        if (currentCount == 3000) {
            log.info("patients_dataset already contains exactly 3000 rows. Idempotent seed skipped.");
            return;
        }

        log.info("patients_dataset count is {} (expected 3000). Starting database seed...", currentCount);

        File csvFile = new File(csvPath);
        if (!csvFile.exists()) {
            // try fallback paths
            csvFile = new File("data/raw/heart_attack_india_3000.csv");
            if (!csvFile.exists()) {
                csvFile = new File("../data/raw/heart_attack_india_3000.csv");
            }
        }

        if (!csvFile.exists()) {
            log.error("Dataset CSV not found at configured path: {}. Seeder aborted.", csvPath);
            return;
        }

        log.info("Reading dataset from: {}", csvFile.getAbsolutePath());
        List<PatientRecord> records = new ArrayList<>(3000);

        try (BufferedReader reader = new BufferedReader(new FileReader(csvFile))) {
            String header = reader.readLine(); // skip header
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                String[] tokens = line.split(",");
                if (tokens.length < 25) continue;

                PatientRecord r = new PatientRecord();
                r.setPatientId(Integer.parseInt(tokens[0].trim()));
                r.setAge(Integer.parseInt(tokens[1].trim()));
                r.setSex(Integer.parseInt(tokens[2].trim()));
                r.setCp(Integer.parseInt(tokens[3].trim()));
                r.setTrestbps(Integer.parseInt(tokens[4].trim()));
                r.setChol(Integer.parseInt(tokens[5].trim()));
                r.setFbs(Integer.parseInt(tokens[6].trim()));
                r.setRestecg(Integer.parseInt(tokens[7].trim()));
                r.setThalach(Integer.parseInt(tokens[8].trim()));
                r.setExang(Integer.parseInt(tokens[9].trim()));
                r.setOldpeak(Double.parseDouble(tokens[10].trim()));
                r.setSlope(Integer.parseInt(tokens[11].trim()));
                r.setCa(Integer.parseInt(tokens[12].trim()));
                r.setThal(Integer.parseInt(tokens[13].trim()));
                r.setSmoking(Integer.parseInt(tokens[14].trim()));
                r.setObesity(Integer.parseInt(tokens[15].trim()));
                r.setDiabetes(Integer.parseInt(tokens[16].trim()));
                r.setHypertension(Integer.parseInt(tokens[17].trim()));
                r.setFamilyHistory(Integer.parseInt(tokens[18].trim()));
                r.setPhysicalActivity(Integer.parseInt(tokens[19].trim()));
                r.setDietQuality(Integer.parseInt(tokens[20].trim()));
                r.setAlcoholUse(Integer.parseInt(tokens[21].trim()));
                r.setAirPollutionExposure(Double.parseDouble(tokens[22].trim()));
                r.setChestPainSeverity(Integer.parseInt(tokens[23].trim()));
                r.setTarget(Integer.parseInt(tokens[24].trim()));

                records.add(r);
            }
        }

        if (records.size() == 3000) {
            patientDatasetRepository.deleteAll();
            patientDatasetRepository.saveAll(records);
            long finalCount = patientDatasetRepository.count();
            log.info("Database seed completed successfully! Final row count: {}", finalCount);
        } else {
            log.warn("Parsed {} rows from CSV, expected 3000. Skipping saveAll.", records.size());
        }
    }
}
