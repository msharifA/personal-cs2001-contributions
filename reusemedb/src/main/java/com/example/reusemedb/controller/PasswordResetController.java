package com.example.reusemedb.controller;

import com.example.reusemedb.DTO.ResetPasswordRequest;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.UserRepository;
import com.example.reusemedb.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
@RestController
@RequestMapping("/api/password")
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            userRepository.save(user);

            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            emailService.sendEmail(user.getEmail(), "Password Reset Request", "Click the link to reset your password: " + resetLink);

            return ResponseEntity.ok("Password reset link sent to your email.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found.");
        }
    }

    @GetMapping("/reset/email")
    public ResponseEntity<?> getEmailByToken(@RequestParam String token) {
        Optional<User> userOptional = userRepository.findByResetToken(token);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return ResponseEntity.ok().body(Map.of("email", user.getEmail()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid or expired token.");
        }
    }

    @PostMapping("/reset/confirm")
    public ResponseEntity<String> confirmResetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByResetToken(request.getToken());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (request.getNewPassword().equals(request.getConfirmPassword())) {
                // Update the password
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));

                // Invalidate the token
                user.setResetToken(null);
                userRepository.save(user);

                return ResponseEntity.ok("Password reset successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("New password and confirm password do not match.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid token.");
        }
    }
}