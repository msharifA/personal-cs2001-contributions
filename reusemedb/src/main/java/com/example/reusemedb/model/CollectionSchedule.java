package com.example.reusemedb.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "collection_schedules")
public class CollectionSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long itemId; 

    @Column(nullable = false)
    private Long donorId;

    @Column(nullable = false)
    private Long receiverId;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime time;

    @Column(nullable = false)
    private String status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getItemId() { 
        return itemId;
    }

    public void setItemId(Long itemId) { 
        this.itemId = itemId;
    }

    public Long getDonorId() {
        return donorId;
    }

    public void setDonorId(Long donorId) {
        this.donorId = donorId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}