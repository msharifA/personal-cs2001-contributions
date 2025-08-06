package com.example.reusemedb.repository;

import com.example.reusemedb.model.SustainabilityMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SustainabilityMetricRepository extends JpaRepository<SustainabilityMetric, Long> {
    Optional<SustainabilityMetric> findByUserId(Long userId);
}