package com.example.reusemedb.service;

import com.example.reusemedb.model.Badge;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.BadgeRepository;
import com.example.reusemedb.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    public Optional<Badge> getBadgeById(Long id) {
        return badgeRepository.findById(id);
    }

    public Badge createBadge(Badge badge) {
        return badgeRepository.save(badge);
    }

    public void deleteBadge(Long id) {
        badgeRepository.deleteById(id);
    }

    public List<Badge> getBadgesByCategory(String category) {
        return badgeRepository.findByCategory(category);
    }

    public List<Badge> getUserBadges(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.map(u -> List.copyOf(u.getBadges())).orElse(List.of());
    }

    @Transactional
    public void checkAndAwardBadges(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            int points = user.getBadgePoints();
            
            // Get all badges the user is eligible for based on points
            List<Badge> eligibleBadges = badgeRepository.findEligibleBadges(points);
            
            // Get badges the user already has
            Set<Badge> currentBadges = user.getBadges();
            
            // Find new badges to award
            Set<Badge> newBadges = eligibleBadges.stream()
                    .filter(badge -> !currentBadges.contains(badge))
                    .collect(Collectors.toSet());
            
            if (!newBadges.isEmpty()) {
                // Add new badges to user's collection
                Set<Badge> updatedBadges = new HashSet<>(currentBadges);
                updatedBadges.addAll(newBadges);
                user.setBadges(updatedBadges);
                userRepository.save(user);
                
                // Create notifications for each new badge
                for (Badge badge : newBadges) {
                    notificationService.createBadgeNotification(user, badge);
                }
            }
        }
    }

    @Transactional
    public void addPointsAndCheckBadges(Long userId, int points) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            int currentPoints = user.getBadgePoints();
            user.setBadgePoints(currentPoints + points);
            userRepository.save(user);
            
            // Check if user qualifies for new badges
            checkAndAwardBadges(userId);
        }
    }
} 