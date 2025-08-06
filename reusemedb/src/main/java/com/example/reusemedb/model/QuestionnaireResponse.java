package com.example.reusemedb.model;

public class QuestionnaireResponse {
    private int clothes;
    private int electricals;
    private int books;
    private int smallFurniture;
    private int largeFurniture;
    private int toys;
    private double co2Savings;

    // Getters and Setters

    public int getClothes() {
        return clothes;
    }

    public void setClothes(int clothes) {
        this.clothes = clothes;
    }

    public int getElectricals() {
        return electricals;
    }

    public void setElectricals(int electricals) {
        this.electricals = electricals;
    }

    public int getBooks() {
        return books;
    }

    public void setBooks(int books) {
        this.books = books;
    }

    public int getSmallFurniture() {
        return smallFurniture;
    }

    public void setSmallFurniture(int smallFurniture) {
        this.smallFurniture = smallFurniture;
    }

    public int getLargeFurniture() {
        return largeFurniture;
    }

    public void setLargeFurniture(int largeFurniture) {
        this.largeFurniture = largeFurniture;
    }

    public int getToys() {
        return toys;
    }

    public void setToys(int toys) {
        this.toys = toys;
    }

    public double getCo2Savings() {
        return co2Savings;
    }

    public void setCo2Savings(double co2Savings) {
        this.co2Savings = co2Savings;
    }
}
