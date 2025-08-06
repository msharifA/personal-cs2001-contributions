package com.example.reusemedb.service;

import com.example.reusemedb.repository.CharityRepository;
import com.example.reusemedb.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailCheckService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CharityRepository charityRepository;

    public String checkEmailType(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            return "user";
        } else if (!charityRepository.findByEmail(email).isEmpty()) {
            return "charity";
        } else {
            return "not_found";
        }
    }

    public String checkEmailTypeByToken(String token) {
        if (userRepository.findByResetToken(token).isPresent()) {
            return "user";
        } else if (charityRepository.findByResetToken(token).isPresent()) {
            return "charity";
        } else {
            return "not_found";
        }
    }

    public String getEmailByToken(String token) {
        return userRepository.findByResetToken(token)
                .map(user -> user.getEmail())
                .orElseGet(() -> charityRepository.findByResetToken(token)
                        .map(charity -> charity.getEmail())
                        .orElse(null));
    }
}