package com.example.reusemedb.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.reusemedb.model.Item;
import com.example.reusemedb.model.SustainabilityMetric;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.ItemRepository;
import com.example.reusemedb.repository.SustainabilityMetricRepository;
import com.example.reusemedb.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
@Service

public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SustainabilityMetricRepository sustainabilityMetricRepository;

    @Autowired
    private EntityManager entityManager;
    
    @Autowired
private ItemRepository itemRepository;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private PasswordEncoder passwordEncoder;
   
    @Autowired
    private EmailService emailService;


    @Transactional
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }
        
        user.setBadgePoints(0);
        
        User savedUser = userRepository.save(user);
        
        badgeService.addPointsAndCheckBadges(savedUser.getId(), 0);
        
        return savedUser;
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    public Iterable<User> findAll() {
        return userRepository.findAll();
    }

    private boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    private boolean usernameExists(String username) {
        return userRepository.findByName(username).isPresent();
    }

    public boolean updatePassword(String email, String oldPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(oldPassword)) {
                user.setPassword(newPassword);
                userRepository.save(user);
                return true;
            } else {
                return false;
            }
        } else {
            throw new IllegalArgumentException("User not found");
        }
    }
    public void sendPasswordResetToken(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            userRepository.save(user);
            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            emailService.sendEmail(email, "Password Reset Request", "To reset your password, click the link below:\n" + resetLink);
            logger.info("Password reset token sent to email: {}", email);
        } else {
            logger.warn("Email not found: {}", email);
            throw new IllegalArgumentException("Email not found");
        }
    }

    public boolean resetPassword(String email, String token, String newPassword) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        } else {
            throw new IllegalArgumentException("User not found");
        }
    }

    public SustainabilityMetric saveSustainabilityMetrics(SustainabilityMetric metrics) {
        return sustainabilityMetricRepository.save(metrics);
    }

    public Optional<SustainabilityMetric> getSustainabilityMetrics(Long id) {
        return sustainabilityMetricRepository.findById(id);
    }

 
    public Long getUserIdFromToken(String token) {
        try {
            String rawToken = token.replace("Bearer ", "");
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(rawToken)
                .getBody();
            return Long.valueOf(claims.getSubject()); 
        } catch (Exception e) {
            return null;
        }
    }

    private byte[] getSigningKey() {

        return "yourSecretKeyHere".getBytes();
    }

   
    @Transactional
    public boolean toggleFollow(Long currentUserId, Long userIdToFollow) {
        System.out.println("Toggle follow: currentUser = " + currentUserId + ", userToFollow = " + userIdToFollow);

        if (currentUserId.equals(userIdToFollow)) {
            System.out.println("Cannot follow self");
            return false;
        }

        String existsQuery = """
            SELECT COUNT(*)
            FROM user_follows
            WHERE follower_id = :follower
              AND followed_id = :followed
            """;
        Long count = ((Number) entityManager.createNativeQuery(existsQuery)
            .setParameter("follower", currentUserId)
            .setParameter("followed", userIdToFollow)
            .getSingleResult()).longValue();

        System.out.println("Existing follow count: " + count);

        if (count == 0) {
            String insertSql = """
                INSERT INTO user_follows (follower_id, followed_id)
                VALUES (:follower, :followed)
                """;
            entityManager.createNativeQuery(insertSql)
                .setParameter("follower", currentUserId)
                .setParameter("followed", userIdToFollow)
                .executeUpdate();
            System.out.println("Inserted new follow relation");
            return true; 
        } else {
            String deleteSql = """
                DELETE FROM user_follows
                WHERE follower_id = :follower
                  AND followed_id = :followed
                """;
            entityManager.createNativeQuery(deleteSql)
                .setParameter("follower", currentUserId)
                .setParameter("followed", userIdToFollow)
                .executeUpdate();
            System.out.println("Deleted follow relation");
            return false; 
        }
    }

  
    @SuppressWarnings("unchecked")
    public List<User> getFollowers(Long userId) {
        String sql = """
            SELECT u.*
            FROM users u
            JOIN user_follows uf ON uf.follower_id = u.id
            WHERE uf.followed_id = :followed
            """;
        return entityManager.createNativeQuery(sql, User.class)
            .setParameter("followed", userId)
            .getResultList();
    }

  
    @SuppressWarnings("unchecked")
    public List<User> getFollowing(Long userId) {
        String sql = """
            SELECT u.*
            FROM users u
            JOIN user_follows uf ON uf.followed_id = u.id
            WHERE uf.follower_id = :follower
            """;
        return entityManager.createNativeQuery(sql, User.class)
            .setParameter("follower", userId)
            .getResultList();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public long getTotalUsers() {
        return userRepository.count();
    }
    
    public Set<Item> addFavouriteItem(Long userId, Long itemId) {
        logger.info("Adding favourite item. User ID: {}, Item ID: {}", userId, itemId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found with id: " + itemId));
        user.getFavouriteItems().add(item);
        userRepository.save(user);
        logger.info("Favourite item added successfully. User ID: {}, Item ID: {}", userId, itemId);
        return user.getFavouriteItems();
    }

    public Set<Item> getFavouriteItems(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return user.getFavouriteItems();
    }

    public Set<Item> removeFavouriteItem(Long userId, Long itemId) {
        logger.info("Removing favourite item. User ID: {}, Item ID: {}", userId, itemId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found with id: " + itemId));
        user.getFavouriteItems().remove(item);
        userRepository.save(user);
        logger.info("Favourite item removed successfully. User ID: {}, Item ID: {}", userId, itemId);
        return user.getFavouriteItems();
    }

    @Transactional
    public User updateCO2Savings(Long userId, Double additionalCO2Savings) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Double currentSavings = user.getCo2Savings();
            Double newSavings = currentSavings + additionalCO2Savings;
            user.setCo2Savings(newSavings);
            
            // Award badge points for environmental impact
            // 100 points per kg of CO2 saved
            int environmentPoints = (int) (additionalCO2Savings * 100);
            badgeService.addPointsAndCheckBadges(userId, environmentPoints);
            
            return userRepository.save(user);
        } else {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
    }
}

