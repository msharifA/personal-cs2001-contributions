package com.example.reusemedb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.reusemedb.model.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
}