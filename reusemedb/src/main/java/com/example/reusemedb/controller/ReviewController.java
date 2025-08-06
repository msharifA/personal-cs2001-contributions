package com.example.reusemedb.controller;

import com.example.reusemedb.model.Review;
import com.example.reusemedb.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/items-by-user/{userId}")
    public ResponseEntity<List<Review>> getReviewsForUsersItems(@PathVariable Long userId) {
        List<Review> reviews = reviewService.getReviewsForItemsByUserId(userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUserId(@PathVariable Long userId) {
        List<Review> reviews = reviewService.getReviewsByUserId(userId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> reviewData) {
        try {
            Review review = new Review();
            review.setRating(Integer.parseInt(reviewData.get("rating").toString()));
            review.setComment((String) reviewData.get("comment"));

            Long userId = Long.parseLong(reviewData.get("userId").toString());
            Long itemId = Long.parseLong(reviewData.get("itemId").toString());

            Review savedReview = reviewService.createReview(review, userId, itemId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reviewId", savedReview.getId());
            return ResponseEntity.ok().body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create review.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping(value = "/item/{itemId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getItemReviews(@PathVariable Long itemId) {
        try {
            List<Review> reviews = reviewService.getItemReviews(itemId);
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(reviews);
        } catch (Exception e) {
            return ResponseEntity.ok().body(new ArrayList<>());
        }
    }

    @GetMapping(value = "/item/{itemId}/stats", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getItemReviewStats(@PathVariable Long itemId) {
        Map<String, Object> stats = reviewService.getItemReviewStats(itemId);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(stats);
    }
}
