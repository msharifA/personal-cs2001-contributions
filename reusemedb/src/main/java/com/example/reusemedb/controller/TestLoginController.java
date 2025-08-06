package com.example.reusemedb.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test-auth")
@CrossOrigin(origins = "*")
public class TestLoginController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        // For test purposes - accept any login with valid format
        if (email != null && password != null && email.contains("@") && password.length() >= 6) {
            Map<String, Object> response = new HashMap<>();
            response.put("token", "test-token-" + System.currentTimeMillis());
            response.put("userId", 1);
            response.put("email", email);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserProfile(@RequestParam(required = false) Long userId) {
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", userId != null ? userId : 1);
        userData.put("name", "Test User");
        userData.put("email", "test@example.com");
        userData.put("role", "user");
        return ResponseEntity.ok(userData);
    }
} 