package com.example.reusemedb.repository;

import com.example.reusemedb.model.Charity;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CharityRepository extends JpaRepository<Charity, Long> {
    List<Charity> findByEmail(String email);
    Optional<Charity> findById(Long charityId);
    Optional<Charity> findByResetToken(String resetToken);
}