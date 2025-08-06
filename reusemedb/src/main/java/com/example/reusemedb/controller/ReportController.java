package com.example.reusemedb.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.reusemedb.DTO.ReportDTO;
import com.example.reusemedb.model.Report;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.ReportRepository;
import com.example.reusemedb.repository.UserRepository;
import com.example.reusemedb.service.ReportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);

    @Autowired
    private ReportService reportService;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> reportUser(@Valid @RequestBody ReportDTO reportDTO) {
        logger.info("Report received: {}", reportDTO);
        Optional<User> reporterOpt = userRepository.findById(reportDTO.getReporterId());
        Optional<User> reportedOpt = userRepository.findById(reportDTO.getReportedId());
    
        if (reporterOpt.isEmpty() || reportedOpt.isEmpty()) {
            logger.warn("Invalid reporter or reported user for DTO: {}", reportDTO);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Invalid reporter or reported user."));
        }
    
        Report report = new Report();
        report.setReporter(reporterOpt.get());
        report.setReported(reportedOpt.get());
        report.setTitle(reportDTO.getTitle());
        report.setReason(reportDTO.getReason());
        report.setCategory(reportDTO.getCategory());
        report.setStatus("PENDING");
    
        Report savedReport = reportService.saveReport(report);
        logger.info("Report saved with id {}", savedReport.getId());
        return ResponseEntity.ok(
                Map.of("success", true, "message", "Report submitted successfully.", "reportId", savedReport.getId()));
    }

    @GetMapping
    public ResponseEntity<?> getReports() {
        List<Report> reports = reportRepository.findAll();
        List<Map<String, Object>> reportList = reports.stream().map(report -> {
            String reporterName = report.getReporter() != null ? report.getReporter().getName() : "Unknown";
            String reportedName = report.getReported() != null ? report.getReported().getName() : "Unknown";
            String status = report.getStatus();
            if (status == null) {
                status = "PENDING"; // default to PENDING if status is null
            }
            return Map.<String, Object>of(
                    "id", report.getId(),
                    "reporterId", report.getReporter() != null ? report.getReporter().getId() : null,
                    "reporterName", reporterName,
                    "reportedId", report.getReported() != null ? report.getReported().getId() : null,
                    "reportedName", reportedName,
                    "title", report.getTitle(),
                    "reason", report.getReason(),
                    "category", report.getCategory().toString(),
                    "status", status,
                    "createdAt", report.getCreatedAt()
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(reportList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Report not found."));
        }
        reportRepository.deleteById(id);
        return ResponseEntity.ok(
                Map.of("success", true, "message", "Report deleted successfully."));
    }
}