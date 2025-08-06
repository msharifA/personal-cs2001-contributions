package com.example.reusemedb.service;

import com.example.reusemedb.model.QuestionnaireResponse;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class QuestionnaireService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionnaireService.class);

    @Autowired
    private UserRepository userRepository;

    public double calculateCO2Savings(QuestionnaireResponse response) {
        // Updated CO2 savings calculation
        double co2Savings = 0;
        co2Savings += response.getClothes() * 5; // 5 kg CO2 saved per clothing item
        co2Savings += response.getElectricals() * 50; // 50 kg CO2 saved per electrical item
        co2Savings += response.getBooks() * 2; // 2 kg CO2 saved per book
        co2Savings += response.getSmallFurniture() * 70; // 70 kg CO2 saved per small furniture item
        co2Savings += response.getLargeFurniture() * 250; // 250 kg CO2 saved per large furniture item
        co2Savings += response.getToys() * 1.5; // 1.5 kg CO2 saved per toy

        logger.info("CO2 Savings Calculation: Clothes: {}, Electricals: {}, Books: {}, Small Furniture: {}, Large Furniture: {}, Toys: {}, Total CO2 Savings: {}",
                response.getClothes() * 5,
                response.getElectricals() * 50,
                response.getBooks() * 2,
                response.getSmallFurniture() * 70,
                response.getLargeFurniture() * 250,
                response.getToys() * 1.5,
                co2Savings);

        return co2Savings;
    }

    public void saveCO2Savings(Long userId, double co2Savings) {
        try {
            // Example: Save CO2 savings to the database
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            user.setCo2Savings(co2Savings);
            userRepository.save(user);
        } catch (Exception e) {
            System.err.println("Error saving CO2 savings: " + e.getMessage());
            throw e;
        }
    }
}
