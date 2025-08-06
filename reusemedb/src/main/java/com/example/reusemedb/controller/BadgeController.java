package com.example.reusemedb.controller;

import com.example.reusemedb.model.Badge;
import com.example.reusemedb.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    @Autowired
    private BadgeService badgeService;

    @GetMapping
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Badge> getBadgeById(@PathVariable Long id) {
        Optional<Badge> badge = badgeService.getBadgeById(id);
        return badge.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Badge>> getBadgesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(badgeService.getBadgesByCategory(category));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Badge>> getUserBadges(@PathVariable Long userId) {
        return ResponseEntity.ok(badgeService.getUserBadges(userId));
    }

    @PostMapping
    public ResponseEntity<Badge> createBadge(@RequestBody Badge badge) {
        return ResponseEntity.ok(badgeService.createBadge(badge));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBadge(@PathVariable Long id) {
        badgeService.deleteBadge(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/user/{userId}/award-points")
    public ResponseEntity<Void> awardPoints(@PathVariable Long userId, @RequestParam("points") int points) {
        badgeService.addPointsAndCheckBadges(userId, points);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/user/{userId}/check-badges")
    public ResponseEntity<Void> checkUserBadges(@PathVariable Long userId) {
        badgeService.checkAndAwardBadges(userId);
        return ResponseEntity.ok().build();
    }
} 