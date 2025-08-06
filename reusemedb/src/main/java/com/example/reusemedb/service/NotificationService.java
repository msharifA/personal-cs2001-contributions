package com.example.reusemedb.service;

import com.example.reusemedb.model.Badge;
import com.example.reusemedb.model.Notification;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadUserNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
    }

    public int countUnreadNotifications(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Transactional
    public Notification createNotification(User user, String message, String type, String actionUrl) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setActionUrl(actionUrl);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification createBadgeNotification(User user, Badge badge) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setBadge(badge);
        notification.setMessage("Congratulations! You've earned the " + badge.getName() + " badge: " + badge.getDescription());
        notification.setType("BADGE");
        notification.setActionUrl("/profile/badges");
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification createItemNotification(User user, Long itemId, String itemName) {
        String message = "A new item \"" + itemName + "\" has been added that might interest you!";
        String actionUrl = "/items/" + itemId;
        return createNotification(user, message, "ITEM", actionUrl);
    }

    @Transactional
    public Notification createMessageNotification(User user, Long senderId, String senderName) {
        String message = "You have received a new message from " + senderName;
        String actionUrl = "/messages/" + senderId;
        return createNotification(user, message, "MESSAGE", actionUrl);
    }

    @Transactional
    public Notification createEventNotification(User user, Long eventId, String eventName) {
        String message = "New event: " + eventName;
        String actionUrl = "/events/" + eventId;
        return createNotification(user, message, "EVENT", actionUrl);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadUserNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
} 