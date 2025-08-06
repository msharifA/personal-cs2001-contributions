package com.example.reusemedb.controller;

import com.example.reusemedb.model.Follow;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.FollowRepository;
import com.example.reusemedb.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/my-following/{followerId}")
    public ResponseEntity<?> getWhoIFollow(@PathVariable Long followerId) {
        System.out.println("Get following for user ID: " + followerId);
        List<User> followed = followRepository.findAllFollowedByUser(followerId);
        System.out.println("Found " + followed.size() + " users that " + followerId + " follows");
        return ResponseEntity.ok(followed);
    }

    @GetMapping("/my-followers/{followedId}")
    public ResponseEntity<?> getMyFollowers(@PathVariable Long followedId) {
        System.out.println("Get followers for user ID: " + followedId);
        List<User> followers = followRepository.findAllFollowersOfUser(followedId);
        System.out.println("Found " + followers.size() + " users following " + followedId);
        return ResponseEntity.ok(followers);
    }

    @PostMapping("/{followedId}")
    public ResponseEntity<?> followUser(@PathVariable Long followedId,
                                       @RequestHeader("X-User-Id") Long followerId) {
        System.out.println("Follow request: " + followerId + " wants to follow " + followedId);
        
        if (followedId.equals(followerId)) {
            System.out.println("Cannot follow self");
            return ResponseEntity.badRequest().body("You cannot follow yourself.");
        }

        boolean alreadyFollowing = followRepository.existsByFollowerIdAndFollowedId(followerId, followedId);
        System.out.println("Already following? " + alreadyFollowing);
        
        if (alreadyFollowing) {
            Follow existingFollow = followRepository.findByFollowerIdAndFollowedId(followerId, followedId)
                .orElse(null);
                
            if (existingFollow != null) {
                followRepository.delete(existingFollow);
                System.out.println("Unfollowed successfully");
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Unfollowed successfully",
                    "isFollowing", false
                ));
            } else {
                System.out.println("Inconsistency detected: existsByFollowerIdAndFollowedId returned true but findByFollowerIdAndFollowedId returned null");
                return ResponseEntity.badRequest().body("Already following this user but couldn't find the follow record.");
            }
        } else {
            User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new IllegalArgumentException("Follower not found"));
            User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new IllegalArgumentException("User to follow not found"));

            Follow follow = new Follow(follower, followed);
            followRepository.save(follow);
            System.out.println("Followed successfully");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Followed successfully",
                "isFollowing", true
            ));
        }
    }

    @DeleteMapping("/{followedId}")
    public ResponseEntity<?> unfollowUser(@PathVariable Long followedId,
                                         @RequestHeader("X-User-Id") Long followerId) {
        System.out.println("Unfollow request: " + followerId + " wants to unfollow " + followedId);
        
        Follow existing = followRepository.findByFollowerIdAndFollowedId(followerId, followedId)
            .orElse(null);

        if (existing == null) {
            System.out.println("Not currently following this user");
            return ResponseEntity.badRequest().body("Not currently following this user.");
        }

        followRepository.delete(existing);
        System.out.println("Unfollow successful");
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Unfollow successful",
            "isFollowing", false
        ));
    }
    
    @GetMapping("/check/{followerId}/{followedId}")
    public ResponseEntity<?> checkFollowStatus(@PathVariable Long followerId, @PathVariable Long followedId) {
        boolean isFollowing = followRepository.existsByFollowerIdAndFollowedId(followerId, followedId);
        return ResponseEntity.ok(Map.of(
            "followerId", followerId,
            "followedId", followedId,
            "isFollowing", isFollowing
        ));
    }
    
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearAllFollows(@PathVariable Long userId) {
        followRepository.deleteAllFollowRelationshipsForUser(userId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Cleared all follow relationships for user " + userId
        ));
    }
}