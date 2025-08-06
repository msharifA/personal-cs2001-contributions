package com.example.reusemedb.model;
 
import jakarta.persistence.Table;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Transient;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
 
 
 
@Entity
@Table(name = "items")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Item {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(nullable = false)
    private String itemName;
 
    @Column(nullable = false)
    private String description;
 
    @Column(nullable = true)
    private String imageUrl;
 
    @Column(nullable = false)
    private String availability;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties(value = {"items", "password", "createdAt", "updatedAt"})
    private User user;
 
    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("item")
    private List<Review> reviews;
 
    @OneToOne(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("item")
    private Book book;
 
    @Column(nullable = false)
    private String category;
 
    @Column(nullable = true, name="sub_category")
    private String subCategory;
 
    @Column(nullable = false)
    private Double price;
 
    @Column(columnDefinition = "GEOMETRY")
    private String coordinates; // WKT representation
 
    @Column
    private String address;
 
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean suspended;
 
    @Transient
    private Long userId;
 
    public Item() {}
 
    public Long getId() {
        return id;
    }
 
    public void setId(Long id) {
        this.id = id;
    }
 
    public String getItemName() {
        return itemName;
    }    
 
    public void setItemName(String itemName) {
        this.itemName = itemName;
    }
 
    public void setCategory(String category) {
    	this.category = category;
    }
 
    public String getCategory() {
    	return category;
    }
 
    public void setSubCategory(String subCategory){
        this.subCategory = subCategory;
    }
 
    public String getSubCategory(){
        return subCategory;
    }
 
    public void setPrice(Double price) {
    	this.price = price;
    }
 
    public Double getPrice(){
    	return price;
    }
 
    public String getDescription() {
        return description;
    }
 
    public void setDescription(String description) {
        this.description = description;
    }
 
    public String getImageUrl() {
        return imageUrl;
    }
 
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
 
    public String getAvailability() {
        return availability;
    }
 
    public void setAvailability(String availability) {
        this.availability = availability;
    }
 
    public User getUser() {
        return user;
    }
 
    public void setUser(User user) {
        this.user = user;
    }
 
    public List<Review> getReviews() {
        return reviews;
    }
 
    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }
 
    public void setCoordinates(String coordinates){
        this.coordinates = coordinates;
    }
 
    public String getCoordinates(){
        return coordinates;
    }
 
    public void setAddress(String address){
        this.address = address;
    }
 
    public String getAddress(){
        return address;
    }
 
    public Long getUserId() {
        return user != null ? user.getId() : userId;
    }
 
    public void setUserId(Long userId) {
        this.userId = userId;
        if (this.user == null || !this.user.getId().equals(userId)) {
            this.user = new User();
            this.user.setId(userId);
        }
    }
 
    public void setBook(Book book){
        this.book = book;
    }

    public Book getBook(){
        return this.book;
    }

    public boolean isSuspended() {
        return suspended;
    }

    public void setSuspended(boolean suspended) {
        this.suspended = suspended;
    }

    @Override
    public String toString(){
        return "{ ID: " + id
                + ", name: " + itemName
                + ", category: " +  category
                + ", price: " + price
                + ", imageUrl: " + imageUrl
                + ", description: " + description
                + ", user_id: " + userId
                + ", reviews: " + reviews
                + " }";
    }
}