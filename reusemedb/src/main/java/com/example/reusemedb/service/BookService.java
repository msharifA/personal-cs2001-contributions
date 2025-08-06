package com.example.reusemedb.service;

import com.example.reusemedb.model.Book;
import com.example.reusemedb.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public Book saveBook(Book book) {
        return bookRepository.save(book);
    }

    public Page<Book> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable);
    }

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    public Book updateBook(Long id, Book bookDetails) {
        Book book = bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Book not found"));
        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setIsbn(bookDetails.getIsbn());
        book.setPublishedYear(bookDetails.getPublishedYear());
        book.setPublisher(bookDetails.getPublisher());
        // book.setPrice(bookDetails.getPrice());
        book.setStock(bookDetails.getStock());
        book.setDonatedBy(bookDetails.getDonatedBy());
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    public String getDonatedBy(Long id) {
        Optional<Book> book = bookRepository.findById(id);
        return book.map(Book::getDonatedBy).orElse("Unknown");
    }
}