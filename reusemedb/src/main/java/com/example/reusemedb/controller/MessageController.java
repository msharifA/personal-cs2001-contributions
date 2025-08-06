package com.example.reusemedb.controller;

import com.example.reusemedb.model.Message;
import com.example.reusemedb.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {
    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageService messageService;

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Message message) {
        try {
            // Log incoming message
            logger.info("Received message: {}", message);

            // Prevent self-messaging
            if (message.getSenderId().equals(message.getReceiverId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "success", false, 
                        "message", "Cannot send message to yourself"
                    ));
            }

            // Save and return the message
            Message savedMessage = messageService.saveMessage(message);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            logger.error("Error sending message", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false, 
                    "message", "Failed to send message: " + e.getMessage()
                ));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMessages(
        @RequestParam(required = false) Long userId1,
        @RequestParam(required = false) Long userId2
    ) {
        try {
            // If both user IDs are provided, return conversation messages
            if (userId1 != null && userId2 != null) {
                List<Message> messages = messageService.getConversationMessages(userId1, userId2);
                return ResponseEntity.ok(messages);
            }

            // If no specific users are specified, return an error
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false, 
                    "message", "Please provide both userId1 and userId2"
                ));
        } catch (Exception e) {
            logger.error("Error fetching messages", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false, 
                    "message", "Failed to fetch messages: " + e.getMessage()
                ));
        }
    }

    // Additional endpoint for retrieving user's conversations
    @GetMapping("/conversations")
    public ResponseEntity<?> getUserConversations(@RequestParam Long userId) {
        try {
            List<Message> conversations = messageService.getUserConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            logger.error("Error fetching user conversations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false, 
                    "message", "Failed to fetch conversations: " + e.getMessage()
                ));
        }
    }
}
