package com.example.reusemedb.controller;

import com.example.reusemedb.service.EmailCheckService;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email-check")
public class EmailCheckController {

    private static final Logger logger = LoggerFactory.getLogger(EmailCheckController.class);

    @Autowired
    private EmailCheckService emailCheckService;

    @PostMapping
    public ResponseEntity<?> checkEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        logger.info("Checking email type for email: {}", email); // Debug log
        String emailType = emailCheckService.checkEmailType(email);
        logger.info("Email type for email {}: {}", email, emailType); // Debug log
        return ResponseEntity.ok(Map.of("emailType", emailType));
    }

    @GetMapping("/token")
    public ResponseEntity<?> checkEmailByToken(@RequestParam String token) {
        logger.info("Checking email type for token: {}", token); // Debug log
        String emailType = emailCheckService.checkEmailTypeByToken(token);
        String email = emailCheckService.getEmailByToken(token); // Get the email associated with the token
        logger.info("Email type for token {}: {}", token, emailType); // Debug log
        return ResponseEntity.ok(Map.of("emailType", emailType, "email", email));
    }
}