package com.example.reusemedb.DTO;

import com.example.reusemedb.model.User;
import java.time.LocalDateTime;

public class CollectionTrackingDTO {
    private User donor;
    private User receiver;
    private String itemName;
    private String status;
    private LocalDateTime scheduledTime;
    private String location;
    
    // Getters and setters
    public User getDonor() {
        return donor;
    }
    
    public void setDonor(User donor) {
        this.donor = donor;
    }
    
    public User getReceiver() {
        return receiver;
    }
    
    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }
    
    public String getItemName() {
        return itemName;
    }
    
    public void setItemName(String itemName) {
        this.itemName = itemName;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }
    
    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
}