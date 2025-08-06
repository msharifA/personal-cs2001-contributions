package com.example.reusemedb.DTO;

import com.example.reusemedb.model.Book;

public record BookFormDTO (
    Book book,
    ItemDTO item
) {}