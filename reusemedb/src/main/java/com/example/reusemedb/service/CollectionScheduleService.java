package com.example.reusemedb.service;

import com.example.reusemedb.model.CollectionSchedule;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.CollectionScheduleRepository;
import com.example.reusemedb.repository.UserRepository;
import com.example.reusemedb.DTO.CollectionTrackingDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CollectionScheduleService {
    private static final Logger logger = LoggerFactory.getLogger(CollectionScheduleService.class);

    @Autowired
    private CollectionScheduleRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public CollectionSchedule createSchedule(CollectionSchedule schedule) {
        
        validateSchedule(schedule);

       
        if (schedule.getStatus() == null) {
            schedule.setStatus("PENDING");
        }

        
        if (schedule.getTime() == null) {
            schedule.setTime(LocalDateTime.now());
        }

        try {
            CollectionSchedule savedSchedule = repository.save(schedule);
            logger.info("Collection schedule created: {}", savedSchedule);
            return savedSchedule;
        } catch (Exception e) {
            logger.error("Error creating collection schedule", e);
            throw new RuntimeException("Could not create collection schedule", e);
        }
    }

    private void validateSchedule(CollectionSchedule schedule) {
        
        if (schedule.getLocation() == null || schedule.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Location is required");
        }

        if (schedule.getDonorId() == null) {
            throw new IllegalArgumentException("Donor ID is required");
        }

        if (schedule.getReceiverId() == null) {
            throw new IllegalArgumentException("Receiver ID is required");
        }

        
        if (schedule.getTime() != null && schedule.getTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Collection time cannot be in the past");
        }

      
        if (schedule.getDonorId().equals(schedule.getReceiverId())) {
            throw new IllegalArgumentException("Donor and Receiver cannot be the same");
        }
    }

    @Transactional
    public CollectionSchedule updateSchedule(Long id, CollectionSchedule scheduleDetails) {
        CollectionSchedule schedule = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Schedule not found with id " + id));

        
        Optional.ofNullable(scheduleDetails.getLocation())
            .ifPresent(schedule::setLocation);
        
        Optional.ofNullable(scheduleDetails.getTime())
            .ifPresent(schedule::setTime);
        
        Optional.ofNullable(scheduleDetails.getStatus())
            .ifPresent(schedule::setStatus);
        
  
        try {
            return repository.save(schedule);
        } catch (Exception e) {
            logger.error("Error updating collection schedule", e);
            throw new RuntimeException("Could not update collection schedule", e);
        }
    }

    public List<CollectionSchedule> getAllSchedules() {
        return repository.findAll();
    }

    public CollectionSchedule getScheduleById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Schedule not found with id " + id));
    }

    public CollectionTrackingDTO getTrackingData(Long id) {
        CollectionSchedule schedule = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Schedule not found with id " + id));
        
        User donor = userRepository.findById(schedule.getDonorId())
            .orElseThrow(() -> new RuntimeException("Donor not found with id " + schedule.getDonorId()));
        
        User receiver = userRepository.findById(schedule.getReceiverId())
            .orElseThrow(() -> new RuntimeException("Receiver not found with id " + schedule.getReceiverId()));

        CollectionTrackingDTO trackingData = new CollectionTrackingDTO();
        trackingData.setDonor(donor);
        trackingData.setReceiver(receiver);

        trackingData.setStatus(schedule.getStatus());
        trackingData.setScheduledTime(schedule.getTime());
        trackingData.setLocation(schedule.getLocation());

        return trackingData;
    }

    public Optional<CollectionSchedule> findLatestCollectionBetweenUsers(Long userId1, Long userId2) {
        return repository.findLatestCollectionBetweenUsers(userId1, userId2);
    }
    public List<CollectionSchedule> getReceivedCollections(Long userId) {
        return repository.findByReceiverId(userId);
    }
}