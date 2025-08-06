package com.example.reusemedb.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.reusemedb.DTO.ResetPasswordRequest;
import com.example.reusemedb.DTO.UpdatePasswordRequest;
import com.example.reusemedb.DTO.UserPostDTO;
import com.example.reusemedb.config.JwtTokenProvider;
import com.example.reusemedb.model.Item;
import com.example.reusemedb.model.SustainabilityMetric;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.ReviewRepository;
import com.example.reusemedb.repository.UserRepository;
import com.example.reusemedb.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    
    @GetMapping("/public/{userId}")
    public ResponseEntity<?> getPublicProfile(@PathVariable Long userId) {
        Optional<User> user = userService.findById(userId);
        if (user.isPresent()) {
           
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("name", user.get().getName());
            profileData.put("surname", user.get().getSurname());
            profileData.put("profilePicture", user.get().getProfilePicture());
            profileData.put("address", user.get().getAddress());
            return ResponseEntity.ok(profileData);
        }
        return ResponseEntity.notFound().build();
    }

    
    @GetMapping("/top-rated")
    public ResponseEntity<?> getTopRatedUsers() {
        
        List<Object[]> rows = reviewRepository.findUserIdAndAvgRating();

        List<Map<String, Object>> result = new ArrayList<>();
        int limit = 5; 
        int count = 0;

        for (Object[] row : rows) {
            Long userId = (Long) row[0];
            Double avgRating = (Double) row[1];

            Optional<User> maybeUser = userRepository.findById(userId);
            if (maybeUser.isPresent()) {
                User u = maybeUser.get();
                Map<String, Object> map = new HashMap<>();
                map.put("userId", u.getId());
                map.put("name", u.getName());
                map.put("surname", u.getSurname());
                map.put("avgRating", avgRating);

                result.add(map);
                count++;
            }
            if (count >= limit) break;
        }
        return ResponseEntity.ok(result);
    }


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserPostDTO userPostDTO) {
        logger.info("Received user registration request: {}", userPostDTO);
        try {
            User user = new User();
            user.setEmail(userPostDTO.getEmail());
            user.setPassword(passwordEncoder.encode(userPostDTO.getPassword()));
            user.setName(userPostDTO.getName());
            user.setSurname(userPostDTO.getSurname());
            user.setAddress(userPostDTO.getAddress());
            user.setProfilePicture(userPostDTO.getProfilePicture());

            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (IllegalArgumentException e) {
            logger.error("Error during user registration: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserPostDTO loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                String token = tokenProvider.createToken(String.valueOf(user.getId()));
                return ResponseEntity.ok(Map.of("token", token, "userId", user.getId()));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Optional<User> user = userService.findById(id);
        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setName(userDetails.getName());
            existingUser.setSurname(userDetails.getSurname());
            existingUser.setAddress(userDetails.getAddress());
            existingUser.setProfilePicture(userDetails.getProfilePicture());
            userService.save(existingUser);
            return ResponseEntity.ok(existingUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                // Encode the new password before saving
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("success", true, "message", "Password updated successfully."));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Old password does not match.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found."));
        }
    }

    @PostMapping("/reset-password-request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        logger.info("Received password reset request for email: {}", email);
        try {
            userService.sendPasswordResetToken(email);
            return ResponseEntity.ok("Password reset link sent to your email.");
        } catch (Exception e) {
            logger.error("Failed to send reset link for email: {}: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "Failed to send reset link."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        logger.info("Received request to reset password for email: {}", request.getEmail());
        logger.info("Request payload: {}", request);

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            logger.warn("Passwords do not match for email: {}", request.getEmail());
            return ResponseEntity.badRequest().body("Passwords do not match");
        }

        try {
            boolean success = userService.resetPassword(request.getEmail(), request.getToken(), request.getNewPassword());
            if (success) {
                logger.info("Password reset successfully for email: {}", request.getEmail());
                return ResponseEntity.ok("Password reset successfully");
            } else {
                logger.warn("Invalid token or email for email: {}", request.getEmail());
                return ResponseEntity.status(401).body("Invalid token or email");
            }
        } catch (IllegalArgumentException e) {
            logger.error("Error resetting password for email: {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        logger.info("Fetching all registered users.");
        try {
            return ResponseEntity.ok(userService.findAll());
        } catch (Exception e) {
            logger.error("Error fetching users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch users."));
        }
    }

    @GetMapping("/{id}/sustainability-metrics")
    public ResponseEntity<?> getSustainabilityMetrics(@PathVariable Long id) {
        Optional<SustainabilityMetric> metrics = userService.getSustainabilityMetrics(id);
        return metrics.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/sustainability-metrics")
    public ResponseEntity<?> saveSustainabilityMetrics(@PathVariable Long id, @RequestBody SustainabilityMetric metrics) {
        metrics.setUser(userService.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found")));
        SustainabilityMetric savedMetrics = userService.saveSustainabilityMetrics(metrics);
        return ResponseEntity.ok(savedMetrics);
    }

   
    @PostMapping("/{userId}/follow")
    public ResponseEntity<?> followUser(@PathVariable Long userId,
                                        @RequestHeader("Authorization") String token) {
        System.out.println("Follow request for user ID: " + userId);

        Long currentUserId = userService.getUserIdFromToken(token);
        if (currentUserId == null) {
            System.out.println("Invalid or missing token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token.");
        }

        System.out.println("Current user ID from token: " + currentUserId);

        try {
            boolean isNowFollowing = userService.toggleFollow(currentUserId, userId);

            String message = isNowFollowing
                ? "Now following user " + userId
                : "Unfollowed user " + userId;

            System.out.println("Follow toggle result: " + message);

            
            List<User> updatedFollowers = userService.getFollowers(userId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", message,
                "isFollowing", isNowFollowing
            ));
        } catch (Exception e) {
            logger.error("Error in follow toggle: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Error processing follow request: " + e.getMessage()
                ));
        }
    }

 
    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable Long userId) {
        List<User> followers = userService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }


    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getFollowing(@PathVariable Long userId) {
        List<User> following = userService.getFollowing(userId);
        return ResponseEntity.ok(following);
    }
    @PostMapping("/{userId}/favourites")
    public ResponseEntity<?> addFavouriteItem(@PathVariable Long userId, @RequestBody Map<String, Long> request) {
        Long itemId = request.get("itemId");
        try {
            Set<Item> favouriteItems = userService.addFavouriteItem(userId, itemId);
            return ResponseEntity.ok(favouriteItems);
        } catch (IllegalArgumentException e) {
            logger.error("Error adding favourite item: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error adding favourite item: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while adding the item to favourites.");
        }
    }

    @GetMapping("/{userId}/favourites")
    public ResponseEntity<?> getFavouriteItems(@PathVariable Long userId) {
        try {
            Set<Item> favouriteItems = userService.getFavouriteItems(userId);
            return ResponseEntity.ok(favouriteItems);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{userId}/favourites/{itemId}")
    public ResponseEntity<?> removeFavouriteItem(@PathVariable Long userId, @PathVariable Long itemId) {
        try {
            Set<Item> favouriteItems = userService.removeFavouriteItem(userId, itemId);
            return ResponseEntity.ok(favouriteItems);
        } catch (IllegalArgumentException e) {
            logger.error("Error removing favourite item: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error removing favourite item: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while removing the item from favourites.");
        }
    }

    @PostMapping("/{id}/co2-savings")
    public ResponseEntity<?> updateCO2Savings(
            @PathVariable Long id,
            @RequestParam Double additionalSavings) {
        try {
            User updatedUser = userService.updateCO2Savings(id, additionalSavings);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating CO2 savings: " + e.getMessage());
        }
    }
}

