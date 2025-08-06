package com.example.reusemedb.service;

import com.example.reusemedb.model.Review;
import com.example.reusemedb.repository.ReviewRepository;
import com.example.reusemedb.repository.UserRepository;
import com.example.reusemedb.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    @Autowired
    public ReviewService(
        ReviewRepository reviewRepository,
        UserRepository userRepository,
        ItemRepository itemRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<Review> getReviewsForItemsByUserId(Long userId) {
        return reviewRepository.findReviewsForItemsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Review> getReviewsByUserId(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    @Transactional
    public Review createReview(Review review, Long userId, Long itemId) {
        if (reviewRepository.existsByItemId(itemId)) {
            throw new IllegalArgumentException("This item has already been reviewed.");
        }
        review.setUser(userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found")));
        review.setItem(itemRepository.findById(itemId)
            .orElseThrow(() -> new IllegalArgumentException("Item not found")));
        // Prevent reviewing own item
        if (review.getItem().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot review your own item");
        }
        // Prevent duplicate reviews
        if (reviewRepository.existsByUserIdAndItemId(userId, itemId)) {
            throw new IllegalArgumentException("You have already reviewed this item");
        }
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        return reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public List<Review> getItemReviews(Long itemId) {
        if (itemId == null) {
            throw new IllegalArgumentException("Item ID cannot be null");
        }
        try {
            return reviewRepository.findByItemId(itemId);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getItemReviewStats(Long itemId) {
        Map<String, Object> stats = new HashMap<>();
        try {
            Double avgRating = reviewRepository.getAverageRatingForItem(itemId);
            Long totalReviews = reviewRepository.getReviewCountForItem(itemId);
            stats.put("averageRating", avgRating != null ? avgRating : 0.0);
            stats.put("totalReviews", totalReviews != null ? totalReviews : 0L);
        } catch (Exception e) {
            stats.put("averageRating", 0.0);
            stats.put("totalReviews", 0L);
        }
        return stats;
    }
}
