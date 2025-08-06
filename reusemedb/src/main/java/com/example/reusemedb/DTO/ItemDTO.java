package com.example.reusemedb.DTO;

import com.example.reusemedb.model.Item;

public record ItemDTO (
    String itemName,
    String description,
    String imageUrl,
    String category,
    String subCategory,
    String availability,
    Double price,
    String address,
    Double longitude,
    Double latitude,
    Long userId
) {
    /**
     * Return Items object. Doesn't set userId. Needs to be set manually useing Item.setUserId
     * @return Item
    */
    public Item toItem(){
        Item item = new Item();
        item.setItemName(this.itemName);
        item.setDescription(this.description);
        item.setImageUrl(this.imageUrl);
        item.setCategory(this.category);
        item.setSubCategory(this.subCategory);
        item.setAvailability(this.availability);
        item.setPrice(this.price);
        item.setAddress(this.address);
        item.setCoordinates(
            String.format("POINT (%f %f)", this.longitude, this.latitude)
        );
        return item;
    }
}
