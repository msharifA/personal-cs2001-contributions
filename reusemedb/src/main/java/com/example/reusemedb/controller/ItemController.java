package com.example.reusemedb.controller;
 
import com.example.reusemedb.DTO.ItemDTO;
import com.example.reusemedb.model.Item;
import com.example.reusemedb.model.Message;
import com.example.reusemedb.model.User;
import com.example.reusemedb.service.ItemService;
import com.example.reusemedb.service.UserService;
import com.example.reusemedb.repository.UserRepository;
import com.example.reusemedb.repository.ItemRepository;
import com.example.reusemedb.repository.MessageRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
 
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;
 
 
 
@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:5173")
public class ItemController {
 
    @Autowired
    private ItemRepository itemRepository;
 
    private final ItemService itemService;
 
    private final UserService userService;
 
    private final UserRepository userRepository;
    
    private final MessageRepository messageRepository;



public ItemController(ItemService itemService, UserService userService, UserRepository userRepository, MessageRepository messageRepository) {
        this.itemService = itemService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }
 
 
    @PostMapping
    public ResponseEntity<?> createItem(
        @RequestBody ItemDTO itemDTO, 
        @RequestParam Long userId) {
        try {
            Item item = itemDTO.toItem();
            item.setUserId(userId);            
            Item savedItem = itemService.saveItem(item);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating item: " + e.getMessage());
        }
    }
 
    @GetMapping("/all")
    public ResponseEntity<?> getAllPublicItems() {
        try {
            List<Item> items = itemService.getAllItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching items: " + e.getMessage());
        }
    }
 
 
    @GetMapping("filter")
    public ResponseEntity<List<Item>> getItems(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<String> subcategories,
            @RequestParam(required = false, defaultValue = "0") Double minPrice,
            @RequestParam(required = false, defaultValue = "1000") Double maxPrice,
            @RequestParam(required = false) String location,
            @RequestParam(required = false, defaultValue = "10") Long radius,
            @RequestParam(required = false) String sort) {
 
        try {
            System.out.println("\n");
            System.out.println("My location: " + location);
            System.out.println("\n");
            List<Item> filteredItems = itemService.getFilteredItems(
                category, subcategories, minPrice, maxPrice, query, sort, location, radius);
 
            return ResponseEntity.ok(filteredItems);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
 
    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        try {
            List<Item> itemList = itemService.getAllItems();
            return ResponseEntity.ok(itemList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
 
 
    @GetMapping(params = "userId")
    public ResponseEntity<List<Item>> getItemsByUserId(@RequestParam Long userId) {
        try {
            List<Item> items = itemService.getItemsByUserId(userId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
 
 
    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody Item item) {
        try {
            Optional<Item> existingItem = itemService.getItemById(id);
            if (existingItem.isPresent()) {
                
                item.setId(id);
 
             
                item.setUser(existingItem.get().getUser());
                Item updatedItem = itemService.saveItem(item);
 
                return ResponseEntity.ok(updatedItem);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating item: " + e.getMessage());
        }
    }
 
    @PutMapping("/{id}/suspend")
    public ResponseEntity<?> suspendItem(@PathVariable Long id) {
        try {
            Optional<Item> existingItem = itemService.getItemById(id);
            if (existingItem.isPresent()) {
                Item item = existingItem.get();
                item.setSuspended(true);
                itemService.saveItem(item);
                return ResponseEntity.ok("Item suspended successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item not found.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error suspending item: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/unsuspend")
    public ResponseEntity<?> unsuspendItem(@PathVariable Long id) {
        try {
            Optional<Item> existingItem = itemService.getItemById(id);
            if (existingItem.isPresent()) {
                Item item = existingItem.get();
                item.setSuspended(false);
                itemService.saveItem(item);
                System.out.println("Item unsuspended: " + item.getId()); // Log the unsuspended item ID
                return ResponseEntity.ok("Item unsuspended successfully.");
            } else {
                System.out.println("Item not found for unsuspend: " + id); // Log if item not found
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item not found.");
            }
        } catch (Exception e) {
            System.err.println("Error unsuspending item: " + e.getMessage()); // Log the error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error unsuspending item: " + e.getMessage());
        }
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        try {
            Optional<Item> itemOpt = itemService.getItemById(id);
            if (itemOpt.isPresent()) {
                return ResponseEntity.ok(itemOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
 
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        try {
            itemService.deleteItem(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
 
 
    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedItems(@RequestParam Long userId) {
        try {
            List<User> following = userService.getFollowing(userId);
            if (following.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
 
            List<Long> followedIds = following.stream()
                    .map(User::getId)
                    .toList();
 
            List<Item> recommendedItems = itemService.findItemsByUserIds(followedIds);
 
            return ResponseEntity.ok(recommendedItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching recommended items: " + e.getMessage());
        }
    }
 
    @GetMapping("/active")
    public ResponseEntity<List<Item>> getActiveItems() {
        
        List<Item> activeItems = itemService.getActiveItems();
        return ResponseEntity.ok(activeItems);
    }
 
    @GetMapping("stats")
    public ResponseEntity<HashMap<String, Long>> getMethodName(@RequestParam Long userId) {
        HashMap<String, Long> stats = itemService.getStats(userId);
        return ResponseEntity.ok(stats);
    }
 
  

    }

   