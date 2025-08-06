package com.example.reusemedb.repository;
 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.reusemedb.model.Item;

import java.util.List;
 
@Repository
public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

    List<Item> findByUser_Id(Long userId);
 
    List<Item> findByUser_IdIn(List<Long> userIds);
 
    List<Item> findByAvailability(String availability);
 
    long countByAvailability(String availability);

    @Query("SELECT COUNT(i) FROM Item i WHERE i.user.id= :userId AND i.availability= :availability")
    Long countByAvailabilityLike(String availability, Long userId);

    @Query("SELECT COUNT(i) FROM Item i WHERE i.user.id= :userId")
    Long countByItem(Long userId);

}