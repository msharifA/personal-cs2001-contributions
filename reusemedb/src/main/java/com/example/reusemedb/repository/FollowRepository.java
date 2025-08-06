package com.example.reusemedb.repository;

import com.example.reusemedb.model.Follow;
import com.example.reusemedb.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollowerIdAndFollowedId(Long followerId, Long followedId);

    Optional<Follow> findByFollowerIdAndFollowedId(Long followerId, Long followedId);

    @Query("SELECT f.followed FROM Follow f WHERE f.follower.id = :followerId")
    List<User> findAllFollowedByUser(@Param("followerId") Long followerId);

    @Query("SELECT f.follower FROM Follow f WHERE f.followed.id = :followedId")
    List<User> findAllFollowersOfUser(@Param("followedId") Long followedId);
    
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followed.id = :userId")
    long countFollowers(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :userId")
    long countFollowing(@Param("userId") Long userId);
    
    @Query("DELETE FROM Follow f WHERE f.follower.id = :userId OR f.followed.id = :userId")
    void deleteAllFollowRelationshipsForUser(@Param("userId") Long userId);
}