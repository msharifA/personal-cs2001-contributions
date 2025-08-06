package com.example.reusemedb.controller;

import com.example.reusemedb.model.QuestionnaireResponse;
import com.example.reusemedb.service.QuestionnaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/questionnaire")
public class QuestionnaireController {

    @Autowired
    private QuestionnaireService questionnaireService;

    @PostMapping("/{userId}")
    public ResponseEntity<?> submitQuestionnaire(@PathVariable Long userId, @Valid @RequestBody QuestionnaireResponse response) {
        // Delegate the calculation to the service
        double co2Savings = questionnaireService.calculateCO2Savings(response);

        // Save the CO2 savings using the service
        questionnaireService.saveCO2Savings(userId, co2Savings);

        // Set the CO2 savings in the response object
        response.setCo2Savings(co2Savings);

        return ResponseEntity.ok(response);
    }
}
