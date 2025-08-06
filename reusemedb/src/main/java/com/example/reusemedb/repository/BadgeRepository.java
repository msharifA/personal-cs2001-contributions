package com.example.reusemedb.repository;

import com.example.reusemedb.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Optional<Badge> findByName(String name);
    
    List<Badge> findByCategory(String category);
    
    @Query("SELECT b FROM Badge b WHERE b.requiredPoints <= :points ORDER BY b.requiredPoints DESC")
    List<Badge> findEligibleBadges(int points);
} 