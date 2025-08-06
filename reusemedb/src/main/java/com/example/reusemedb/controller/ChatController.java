package com.example.reusemedb.controller;

import com.example.reusemedb.model.Message;
import com.example.reusemedb.service.MessageService;
import com.example.reusemedb.model.Item;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.ItemRepository;
import com.example.reusemedb.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@RequestBody Message message, Authentication authentication) {
        try {
            
            Long senderId = Long.parseLong(authentication.getName());
            
           
            if (message.getMessage() == null || message.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "success", false, 
                        "message", "Message cannot be empty"
                    ));
            }

            
            message.setSenderId(senderId);

            
            if (message.getReceiverId() == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "success", false, 
                        "message", "Receiver ID is required"
                    ));
            }

          
            if (senderId.equals(message.getReceiverId())) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "success", false, 
                        "message", "Cannot send message to yourself"
                    ));
            }

           
            if (message.getTimestamp() == null) {
                message.setTimestamp(LocalDateTime.now());
            }

            
            Message savedMessage = messageService.saveMessage(message);
            
            return ResponseEntity.ok(savedMessage);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error sending message", e);
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false, 
                    "message", e.getMessage()
                ));
        } catch (Exception e) {
            logger.error("Error sending message", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false, 
                    "message", "Failed to send message: " + e.getMessage()
                ));
        }
    }

    @GetMapping("/conversations/{userId1}/{userId2}")
    public ResponseEntity<?> getConversationMessages(
        @PathVariable Long userId1, 
        @PathVariable Long userId2
    ) {
        try {
            List<Message> messages = messageService.getConversationMessages(userId1, userId2);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            logger.error("Error fetching conversation messages", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false, 
                    "message", "Failed to fetch messages"
                ));
        }
    }

    @PostMapping("/conversation/confirmtransaction/{userId1}/{userId2}")
    public ResponseEntity<?> confirmTransaction(
        @PathVariable Long userId1,
        @PathVariable Long userId2,
        @RequestBody Map<String, Long> request
    ) {
        try {
            Long itemId = request.get("itemId");

            
            Optional<Item> itemOptional = itemRepository.findById(itemId);
            if (itemOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Item not found."));
            }

            Item item = itemOptional.get();

           
            item.setAvailability("CONFIRMED");
            itemRepository.save(item);

            Message confirmationMessage = new Message();
            confirmationMessage.setSenderId(userId1); 
            confirmationMessage.setReceiverId(userId2); 
            confirmationMessage.setMessage("✅ Pickup confirmed for item: " + item.getItemName());
            confirmationMessage.setItemId(itemId);
            confirmationMessage.setTimestamp(LocalDateTime.now());
            messageService.saveMessage(confirmationMessage);

            return ResponseEntity.ok(Map.of("success", true, "message", "Pickup confirmed successfully."));
        } catch (Exception e) {
            logger.error("Error confirming transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to confirm pickup."));
        }
    }
}