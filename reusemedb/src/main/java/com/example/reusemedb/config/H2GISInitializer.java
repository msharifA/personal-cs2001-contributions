package com.example.reusemedb.config;
 
import org.h2gis.functions.factory.H2GISFunctions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
 
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
 
@Configuration
public class H2GISInitializer {
 
    @Autowired
    private DataSource dataSource;
 
    @EventListener(ContextRefreshedEvent.class)
    public void initializeH2GIS() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            // Initialize H2GIS functions
            H2GISFunctions.load(connection);
 
            // Enable logs
            System.out.println("H2GIS spatial functions have been initialized.");
        } catch (SQLException e) {
            System.err.println("Error initializing H2GIS: " + e.getMessage());
            throw e;
        }
    }
}