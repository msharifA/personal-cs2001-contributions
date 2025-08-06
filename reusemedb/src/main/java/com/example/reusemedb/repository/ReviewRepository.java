package com.example.reusemedb.repository;

import com.example.reusemedb.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByUserId(Long userId);

    List<Review> findByItemId(Long itemId);

    boolean existsByItemId(Long itemId); 

    @Query("SELECT r FROM Review r WHERE r.item.user.id = :userId")
    List<Review> findReviewsForItemsByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.item.id = ?1")
    Double getAverageRatingForItem(Long itemId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.item.id = ?1")
    Long getReviewCountForItem(Long itemId);

    boolean existsByUserIdAndItemId(Long userId, Long itemId);


    @Query("SELECT r.item.user.id AS userId, AVG(r.rating) AS avgRating " +
           "FROM Review r " +
           "GROUP BY r.item.user.id " +
           "HAVING COUNT(r.id) >= 1 " +
           "ORDER BY avgRating DESC")
    List<Object[]> findUserIdAndAvgRating();
}
