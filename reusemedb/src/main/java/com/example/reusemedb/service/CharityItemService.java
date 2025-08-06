package com.example.reusemedb.service;

import com.example.reusemedb.model.CharityItem;
import com.example.reusemedb.repository.CharityItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CharityItemService {

    @Autowired
    private CharityItemRepository charityItemRepository;

    public CharityItem saveItem(CharityItem item) {
        return charityItemRepository.save(item);
    }

    public List<CharityItem> getItemsByCharityId(Long charityId) {
        return charityItemRepository.findByCharityId(charityId);
    }

    public void deleteItem(Long itemId) {
        charityItemRepository.deleteById(itemId);
    }
}
