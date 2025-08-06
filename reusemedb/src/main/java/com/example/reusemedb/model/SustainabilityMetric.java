package com.example.reusemedb.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "sustainability_metrics")
public class SustainabilityMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int itemsReused;
    private int carbonFootprintSaved; // in grams
    private Date lastUpdated;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getItemsReused() {
        return itemsReused;
    }

    public void setItemsReused(int itemsReused) {
        this.itemsReused = itemsReused;
    }

    public int getCarbonFootprintSaved() {
        return carbonFootprintSaved;
    }

    public void setCarbonFootprintSaved(int carbonFootprintSaved) {
        this.carbonFootprintSaved = carbonFootprintSaved;
    }

    public Date getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Date lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
