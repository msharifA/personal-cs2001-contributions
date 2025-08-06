package com.example.reusemedb.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.reusemedb.model.Report;
import com.example.reusemedb.repository.ReportRepository;

@Service
public class ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    @Autowired
    private ReportRepository reportRepository;

    public Report saveReport(Report report) {
        logger.debug("Validating report: {}", report);
        if (report.getTitle() == null || report.getTitle().trim().isEmpty()) {
            logger.error("Report title is missing");
            throw new IllegalArgumentException("Report title is required");
        }
        if (report.getReason() == null || report.getReason().trim().isEmpty()) {
            logger.error("Report reason is missing");
            throw new IllegalArgumentException("Report reason is required");
        }
        // After validation, save the report
        Report savedReport = reportRepository.save(report);
        logger.debug("Report successfully saved: {}", savedReport);
        return savedReport;
    }
}