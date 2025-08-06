package com.example.reusemedb.repository;

import com.example.reusemedb.model.CharityItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CharityItemRepository extends JpaRepository<CharityItem, Long> {
    List<CharityItem> findByCharityId(Long charityId);
}
