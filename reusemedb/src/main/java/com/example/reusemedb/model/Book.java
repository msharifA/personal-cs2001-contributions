package com.example.reusemedb.model;
 
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
 
@Entity
@Table(name = "books")
public class Book {
 
    @Id
    private Long id;
 
    @OneToOne
    @MapsId // if no @JoinColumn, column name defaults to items_id
    private Item item;
 
 
    @Column(nullable = false)
    private String title;
 
    @Column(nullable = false)
    private String author;
 
    @Column(nullable = false, unique = true)
    private String isbn;
 
    @Column(nullable = false)
    private int publishedYear;
 
    @Column(nullable = false)
    private String publisher;
 
    @Column(nullable = false)
    private int stock;
 
    @Column(nullable = true)
    private String donatedBy;
 
    @Column(nullable = false)
    private Long userId; // ✅ Required to associate the book with a user
 
    // Getters and Setters
    public Long getId() {
        return id;
    }
 
    public void setId(Long id) {
        this.id = id;
    }
 
    public String getTitle() {
        return title;
    }
 
    public void setTitle(String title) {
        this.title = title;
    }
 
    public String getAuthor() {
        return author;
    }
 
    public void setAuthor(String author) {
        this.author = author;
    }
 
    public String getIsbn() {
        return isbn;
    }
 
    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }
 
    public int getPublishedYear() {
        return publishedYear;
    }
 
    public void setPublishedYear(int publishedYear) {
        this.publishedYear = publishedYear;
    }
 
    public String getPublisher() {
        return publisher;
    }
 
    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }
 
    public int getStock() {
        return stock;
    }
 
    public void setStock(int stock) {
        this.stock = stock;
    }
 
    public String getDonatedBy() {
        return donatedBy;
    }
 
    public void setDonatedBy(String donatedBy) {
        this.donatedBy = donatedBy;
    }
 
    public Long getUserId() {
        return userId;
    }
 
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setItem(Item item){
        this.item = item;
    }

    public Item getItem(){
        return this.item;
    }
 
    @Override
    public String toString() {
        return "Book{" +
               "id=" + id +
               ", title='" + title + '\'' +
               ", author='" + author + '\'' +
               ", isbn='" + isbn + '\'' +
               ", publishedYear=" + publishedYear +
               ", publisher='" + publisher + '\'' +
               ", stock=" + stock +
               ", donatedBy='" + donatedBy + '\'' +
               ", userId=" + userId +
               '}';
    }
}