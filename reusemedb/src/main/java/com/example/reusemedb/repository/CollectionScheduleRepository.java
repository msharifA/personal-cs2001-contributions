package com.example.reusemedb.repository;

import com.example.reusemedb.model.CollectionSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionScheduleRepository extends JpaRepository<CollectionSchedule, Long> {
    @Query("SELECT cs FROM CollectionSchedule cs WHERE cs.donorId = :userId OR cs.receiverId = :userId ORDER BY cs.time DESC")
    List<CollectionSchedule> findByUserId(@Param("userId") Long userId);

    List<CollectionSchedule> findByDonorIdOrReceiverId(Long donorId, Long receiverId);

    @Query("SELECT cs FROM CollectionSchedule cs WHERE " +
           "(cs.donorId = :userId OR cs.receiverId = :userId) " +
           "AND cs.status = 'PENDING' " +
           "ORDER BY cs.time DESC")
    List<CollectionSchedule> findPendingSchedulesByUserId(@Param("userId") Long userId);

    @Query("SELECT cs FROM CollectionSchedule cs WHERE " +
           "((cs.donorId = :userId1 AND cs.receiverId = :userId2) OR " +
           "(cs.donorId = :userId2 AND cs.receiverId = :userId1)) " +
           "ORDER BY cs.time DESC")
    Optional<CollectionSchedule> findLatestCollectionBetweenUsers(
        @Param("userId1") Long userId1, 
        @Param("userId2") Long userId2
    );

    List<CollectionSchedule> findByReceiverId(Long receiverId);
}