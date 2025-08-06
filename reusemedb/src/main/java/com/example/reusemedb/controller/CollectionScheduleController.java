package com.example.reusemedb.controller;

import com.example.reusemedb.model.CollectionSchedule;
import com.example.reusemedb.model.Item;
import com.example.reusemedb.model.Message;
import com.example.reusemedb.repository.ItemRepository;
import com.example.reusemedb.repository.MessageRepository;
import com.example.reusemedb.service.CollectionScheduleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/collections")
@CrossOrigin(origins = "http://localhost:5173")
public class CollectionScheduleController {
    private static final Logger logger = LoggerFactory.getLogger(CollectionScheduleController.class);

    @Autowired
    private CollectionScheduleService service;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ItemRepository itemRepository;

    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody CollectionSchedule schedule, Authentication authentication) {
        try {
            Long currentUserId = Long.parseLong(authentication.getName());

            // Validate the itemId
            Optional<Item> itemOptional = itemRepository.findById(schedule.getItemId());
            if (itemOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Item not found."));
            }

            Item item = itemOptional.get();

            
            CollectionSchedule createdSchedule = service.createSchedule(schedule);

            Message message = new Message();
            message.setSenderId(schedule.getReceiverId());
            message.setReceiverId(schedule.getDonorId());
            message.setMessage(String.format(
                "📦 A collection has been scheduled for item: %s (Item ID: %d) on %s at %s.",
                item.getItemName(), 
                item.getId(),       
                schedule.getTime(), 
                schedule.getLocation() 
            ));
            message.setItemId(item.getId()); 
            message.setMessageType("COLLECTION_SCHEDULE"); 
            message.setTimestamp(LocalDateTime.now());
            messageRepository.save(message);

            return ResponseEntity.ok(createdSchedule);
        } catch (Exception e) {
            logger.error("Error creating schedule", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to create schedule."));
        }
    }

 
    
}