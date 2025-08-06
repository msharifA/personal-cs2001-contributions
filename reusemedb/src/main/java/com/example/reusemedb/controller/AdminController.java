package com.example.reusemedb.controller;

import java.lang.management.ManagementFactory;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.reusemedb.service.ItemService;
import com.example.reusemedb.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ItemService itemService;
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if ("Admin@reuseme.com".equals(email) && "Admin_Password".equals(password)) {
            return ResponseEntity.ok(Map.of(
                "token", "admin-token", 
                "email", email,
                "userType", "admin"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid admin credentials"));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching users: " + e.getMessage());
        }
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getAppMetrics() {
        try {
            // Calculate server uptime
            long uptimeMillis = ManagementFactory.getRuntimeMXBean().getUptime();
            long uptimeHours = TimeUnit.MILLISECONDS.toHours(uptimeMillis);

            // Calculate database size
            String dbPath = "reusemedb.mv.db"; // Adjusted to relative path
            long dbSizeBytes = Files.exists(Paths.get(dbPath)) ? Files.size(Paths.get(dbPath)) : 0;
            double dbSizeGB = dbSizeBytes / (1024.0 * 1024.0 * 1024.0);

            Map<String, Object> metrics = Map.of(
                "totalItems", itemService.getTotalItems(),
                "activeExchanges", itemService.getActiveExchangesCount(),
                "totalUsers", userService.getTotalUsers(),
                "pendingApprovals", itemService.getPendingApprovalsCount(),
                "serverUptime", uptimeHours,
                "databaseSize", dbSizeGB
            );

            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            logger.error("Error fetching metrics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error fetching metrics: " + e.getMessage()));
        }
    }
}
