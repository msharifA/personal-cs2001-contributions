package com.example.reusemedb.service;
 
import com.example.reusemedb.model.Item;
import com.example.reusemedb.model.User;
import com.example.reusemedb.repository.ItemRepository;
import com.example.reusemedb.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;
 
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
 
 
@Service
@Transactional
public class ItemService {
 
    @Autowired
    private ItemRepository itemRepository;
 
    @Autowired
    private UserRepository userRepository;
 
    @Autowired
    private BadgeService badgeService;
 
 
    public Item saveItem(Item item) {
        if (item.getItemName() == null || item.getItemName().isEmpty()) {
            throw new IllegalArgumentException("Item name cannot be null or empty");
        }
        User user = userRepository.findById(item.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + item.getUserId()));
        item.setUser(user);
 
        return itemRepository.save(item);
    }
 
 
    @Transactional(readOnly = true)
    public List<Item> getItemsByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        return itemRepository.findByUser_Id(userId);
    }
 
 
    @Transactional(readOnly = true)
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }
 
 
    @Transactional(readOnly = true)
    public Optional<Item> getItemById(Long itemId) {
        return itemRepository.findById(itemId);
    }
 
 
    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }
 
 
    @Transactional(readOnly = true)
    public List<Item> findItemsByUserIds(List<Long> userIds) {
        return itemRepository.findByUser_IdIn(userIds);
    }
 
    @Transactional(readOnly = true)
    public List<Item> getActiveItems() {
        return itemRepository.findByAvailability("AVAILABLE");
    }
 
    public long getTotalItems() {
        return itemRepository.count();
    }
 
    public long getActiveExchangesCount() {
        return itemRepository.countByAvailability("EXCHANGING");
    }
 
    public long getPendingApprovalsCount() {
        return itemRepository.countByAvailability("PENDING");
    }
 
    public Predicate isDistanceWithin(CriteriaBuilder cb, Root<Item> table, String coordinates, Long radius){
        Predicate withinDistance = cb.isTrue(
            cb.function(
                "ST_DWithin",          
                Boolean.class,         
                cb.function(                
                    "ST_Transform", 
                    Object.class,
                    cb.function(
                        "ST_GeomFromText", 
                        Object.class, 
                        table.get("coordinates"), 
                        cb.literal(4326)
                    ),
                    cb.literal(3857)
                ),
                cb.function(
                    "ST_Transform", 
                    Object.class,
                    cb.function(
                        "ST_PointFromText", 
                        Object.class,
                        cb.literal(coordinates), // Replace with dynamic coords
                        cb.literal(4326)
                    ),
                    cb.literal(3857)
                ),
                cb.literal(radius * 1000)
            )
        );
 
        return withinDistance;
    }
 
    public List<Item> getFilteredItems(
        String category, 
        List<String> subCategory, 
        Double minPrice, 
        Double maxPrice, 
        String name, 
        String sort,
        String location,
        Long radius
    ){
        return itemRepository.findAll((table, query, criteriaBuilder) ->{
            /* CriteriaBuilder = This is the main object that dynamically builds your query
               table = This represents the table. Use this to get the columns
               query = contains stuff like select, where, from etc.
               predicates = Special objects that represent conditionals. Used mainly in JpaSpecifications */ 
 
            // PREDICATES
 
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.conjunction());  // where true (incase no filter has been passed)
 
            if (location != null){
                predicates.add(isDistanceWithin(criteriaBuilder, table, location, radius));
            }
 
            if (subCategory != null){
                predicates.add(table.get("subCategory").in(subCategory));
            } else if (category != null){
                predicates.add(criteriaBuilder.equal(table.get("category"), category));
            }
 
            if (name != null){
                predicates.add(criteriaBuilder.like(table.get("itemName"), "%"+name+"%"));
            }
 
            if (maxPrice != 1000.0){
                predicates.add(criteriaBuilder.between(table.get("price"), minPrice, maxPrice));
            } else{
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(table.get("price"), minPrice));
            }
 
            // SELECTION: SORT
            query.where(criteriaBuilder.and(predicates.toArray(new Predicate[0])));   // convert predicates to CriteriaQuery type for sorting
            if (sort != null){
                if (sort.equals("price_high_low")){
                    query.orderBy(criteriaBuilder.desc(table.get("price")));
                } else if(sort.equals("price_low_high")){
                    query.orderBy(criteriaBuilder.asc(table.get("price")));
                }
            }
            return query.getRestriction();
        });
    }
 
    public HashMap<String, Long> getStats(long userId){
        HashMap<String, Long> stats = new HashMap<String, Long>();
        stats.put("totalItems", itemRepository.countByItem(userId));
        stats.put("activeExchanges", itemRepository.countByAvailabilityLike("AVAILABLE", userId));
        stats.put("pendingApprovals", itemRepository.countByAvailabilityLike("PENDING", userId));
        return stats;
    }
 
    public Item addItem(Item item) {
        Item savedItem = itemRepository.save(item);
        
        // Award badge points for creating an item
        if (savedItem.getUser() != null) {
            // Award 100 points for each item (matches the "Contributor" badge's required points)
            badgeService.addPointsAndCheckBadges(savedItem.getUser().getId(), 100);
            
            // If it's a book, award extra points toward the "Book Lover" badge
            if (savedItem.getCategory() != null && 
                (savedItem.getCategory().equalsIgnoreCase("Books") || 
                 savedItem.getCategory().equalsIgnoreCase("Book"))) {
                badgeService.addPointsAndCheckBadges(savedItem.getUser().getId(), 100);
            }
        }
        
        return savedItem;
    }
}
 
