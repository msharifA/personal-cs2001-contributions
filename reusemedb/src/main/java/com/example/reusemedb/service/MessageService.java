package com.example.reusemedb.service;

import com.example.reusemedb.model.Message;
import com.example.reusemedb.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Transactional
    public Message saveMessage(Message message) {
        // Comprehensive validation
        validateMessage(message);

        // Ensure timestamp is set
        if (message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now());
        }

        return messageRepository.save(message);
    }

    private void validateMessage(Message message) {
        // Validate sender ID
        if (message.getSenderId() == null) {
            throw new IllegalArgumentException("Sender ID is required");
        }

        // Validate receiver ID
        if (message.getReceiverId() == null) {
            throw new IllegalArgumentException("Receiver ID is required");
        }

        // Validate message content
        if (message.getMessage() == null || message.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }

        // Prevent self-messaging
        if (message.getSenderId().equals(message.getReceiverId())) {
            throw new IllegalArgumentException("Cannot send message to yourself");
        }
    }

    public List<Message> getConversationMessages(Long userId1, Long userId2) {
        return messageRepository.findConversationMessages(userId1, userId2);
    }

    public List<Message> getUserMessages(Long userId) {
        return messageRepository.findUserMessages(userId);
    }

    // ✅ Added to fix controller error
    public List<Message> getUserConversations(Long userId) {
        return messageRepository.findUserMessages(userId);
    }
}
