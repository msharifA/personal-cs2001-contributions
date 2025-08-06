package com.example.reusemedb.controller;

import com.example.reusemedb.model.CharityItem;
import com.example.reusemedb.service.CharityItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/charity-items")
@CrossOrigin(origins = "http://localhost:5173")
public class CharityItemController {

    @Autowired
    private CharityItemService charityItemService;

    @PostMapping
    public ResponseEntity<?> addItem(@RequestBody CharityItem item) {
        CharityItem savedItem = charityItemService.saveItem(item);
        return ResponseEntity.ok(savedItem);
    }

    @GetMapping("/{charityId}")
    public ResponseEntity<?> getItemsByCharity(@PathVariable Long charityId) {
        List<CharityItem> items = charityItemService.getItemsByCharityId(charityId);
        return ResponseEntity.ok(items);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> deleteItem(@PathVariable Long itemId) {
        charityItemService.deleteItem(itemId);
        return ResponseEntity.ok("Item deleted successfully.");
    }
}
