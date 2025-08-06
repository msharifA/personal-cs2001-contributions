package com.example.reusemedb.DTO;

// Used by GeocodingController
public record LocationDTO (
    String address,
    Double latitude,
    Double longitude,
    String message,
    String messageColor
) {}