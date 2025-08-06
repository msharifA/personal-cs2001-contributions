package com.example.reusemedb.controller;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.reusemedb.DTO.ResetPasswordRequest;
import com.example.reusemedb.model.Charity;
import com.example.reusemedb.service.CharityService;
import com.example.reusemedb.DTO.UpdatePasswordRequest;
import com.example.reusemedb.config.JwtTokenProvider;

import java.util.HashMap;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/charities")
@CrossOrigin(origins = "http://localhost:5173")
public class CharityController {

    private static final Logger logger = LoggerFactory.getLogger(CharityController.class);
    
    @Autowired
    private CharityService charityService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerCharity(@RequestBody Charity charity) {
        try {
            Charity savedCharity = charityService.saveCharity(charity);
            System.out.println("Charity registered with ID: " + savedCharity.getId()); // Debug log
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCharity);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "Registration failed"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        logger.info("Received request to reset password for email: {}", resetPasswordRequest.getEmail());
        
        if (!resetPasswordRequest.getNewPassword().equals(resetPasswordRequest.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }
    
        try {
            charityService.resetPassword(
                resetPasswordRequest.getEmail(),
                resetPasswordRequest.getToken(),
                resetPasswordRequest.getNewPassword()
            );
            return ResponseEntity.ok("Password reset successfully");
        } catch (IllegalArgumentException e) {
            logger.error("Error resetting password: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/reset-password")
    public ResponseEntity<?> getEmailByToken(@RequestParam String token) {
        try {
            Charity charity = charityService.findByResetToken(token);
            if (charity != null) {
                return ResponseEntity.ok(Map.of("email", charity.getEmail()));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token.");
            }
        } catch (Exception e) {
            logger.error("Error fetching email by token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token.");
        }
    }

    @PostMapping("/reset-password-request")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        logger.info("Received forgot password request for email: {}", email);
        try {
            charityService.sendPasswordResetToken(email);
            return ResponseEntity.ok("Password reset link sent to your email.");
        } catch (Exception e) {
            logger.error("Failed to send reset link: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "Failed to send reset link."));
        }
    }
   

    @PostMapping("/login")
    public ResponseEntity<?> loginCharity(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        logger.info("Received login request for charity email: {}", email);

        try {
            boolean success = charityService.loginCharity(email, password);
            if (success) {
                Charity charity = charityService.findByEmail(email);
                String token = tokenProvider.createToken(String.valueOf(charity.getId()));
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("charityId", charity.getId());
                response.put("userId", charity.getUserId());
                response.put("userType", "charity");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid credentials"));
            }
        } catch (Exception e) {
            logger.error("Login failed for charity email: {}", email, e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", "Login failed"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCharityById(@PathVariable Long id) {
        System.out.println("Fetching charity with ID: " + id); // Debug log
        Charity charity = charityService.findById(id);
        if (charity != null) {
            System.out.println("Fetched charity with ID: " + id); // Debug log
            return ResponseEntity.ok(charity);
        } else {
            System.out.println("Charity not found with ID: " + id); // Debug log
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "message", "Charity not found"));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCharity(@PathVariable Long id, @RequestBody Charity charityDetails) {
        logger.info("Received request to update charity with ID: {}", id);
        try {
            Charity updatedCharity = charityService.updateCharity(id, charityDetails);
            return ResponseEntity.ok(updatedCharity);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating charity: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllCharities() {
        logger.info("Fetching all registered charities.");
        try {
            var charities = charityService.getAllCharities();
            logger.info("Number of charities fetched: {}", charities.size()); // Debug log
            return ResponseEntity.ok(charities);
        } catch (Exception e) {
            logger.error("Error fetching charities: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch charities."));
        }
    }
}