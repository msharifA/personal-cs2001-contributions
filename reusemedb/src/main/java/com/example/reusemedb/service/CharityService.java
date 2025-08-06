package com.example.reusemedb.service;

import com.example.reusemedb.DTO.ResetPasswordRequest;
import com.example.reusemedb.model.Charity;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.CharityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CharityService {

    private static final Logger logger = LoggerFactory.getLogger(CharityService.class);

    @Autowired
    private CharityRepository charityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public Charity findByEmail(String email) {
        logger.info("Finding charity by email: {}", email);
        List<Charity> charities = charityRepository.findByEmail(email);
        if (charities.size() == 1) {
            return charities.get(0);
        } else if (charities.isEmpty()) {
            return null;
        } else {
            throw new IllegalArgumentException("Multiple charities found with the same email");
        }
    }

    public Charity findByResetToken(String token) {
        return charityRepository.findByResetToken(token).orElse(null);
    }

    public Charity saveCharity(Charity charity) {
        if (charity.getUserId() == null) {
            charity.setUserId(generateUserId()); // Automatically generate userId
        }
        charity.setPassword(passwordEncoder.encode(charity.getPassword()));
        return charityRepository.save(charity);
    }
    private Long generateUserId() {
        // Generate a unique userId (e.g., based on the current timestamp or a sequence)
        return System.currentTimeMillis();
    }

    public Charity findById(Long id) {
        return charityRepository.findById(id).orElse(null);
    }

    public void resetPassword(String email, String token, String newPassword) {
        Charity charity = findByEmail(email);
        if (charity != null && charity.getResetToken().equals(token)) {
            charity.setPassword(passwordEncoder.encode(newPassword));
            charity.setResetToken(null); // Clear the reset token after successful reset
            charityRepository.save(charity);
        } else {
            throw new IllegalArgumentException("Invalid token or charity not found");
        }
    }

    public void sendPasswordResetToken(String email) {
        Charity charity = findByEmail(email);
        if (charity != null) {
            String token = UUID.randomUUID().toString();
            charity.setResetToken(token);
            charityRepository.save(charity);
            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            emailService.sendEmail(email, "Password Reset Request", "To reset your password, click the link below:\n" + resetLink);
        } else {
            throw new IllegalArgumentException("Email not found");
        }
    }

    public boolean loginCharity(String email, String password) {
        Charity charity = findByEmail(email);
        if (charity != null) {
            if (passwordEncoder.matches(password, charity.getPassword())) {
                logger.info("Charity login successful for email: {}", email);
                return true;
            } else {
                logger.warn("Invalid password for charity email: {}", email);
                return false;
            }
        } else {
            logger.warn("Charity not found for email: {}", email);
            return false;
        }
    }
    public Charity updateCharity(Long id, Charity charityDetails) {
        Charity charity = charityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Charity not found with id: " + id));
        
        charity.setCharityName(charityDetails.getCharityName());
        charity.setEmail(charityDetails.getEmail());
        charity.setAddress(charityDetails.getAddress());
        charity.setPhone(charityDetails.getPhone());
        // Only update the password if it's provided and different from the current one
        if (charityDetails.getPassword() != null && !charityDetails.getPassword().isEmpty() && 
            !passwordEncoder.matches(charityDetails.getPassword(), charity.getPassword())) {
            charity.setPassword(passwordEncoder.encode(charityDetails.getPassword()));
        }
        return charityRepository.save(charity);
    }

    public List<Charity> getAllCharities() {
        logger.info("Retrieving all registered charities from the database.");
        var charities = charityRepository.findAll();
        logger.info("Number of charities retrieved: {}", charities.size()); // Debug log
        return charities;
    }
}

