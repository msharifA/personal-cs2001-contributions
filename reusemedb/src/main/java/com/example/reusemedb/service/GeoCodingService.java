package com.example.reusemedb.service;
 
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
 
import org.springframework.stereotype.Service;
 
import com.example.reusemedb.DTO.LocationDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
 
 
 
@Service
public class GeoCodingService {
    /**
     * Makes a request to Nominatim with the given location
     * @param address the address to query. Do not encode.
     * @return Json formatted string
    */
    public String requestNominatimLocation(String address){
        try {
            String encodedQuery = URLEncoder.encode(address, "UTF-8");
            String urlString = "https://nominatim.openstreetmap.org/search?q=" + encodedQuery + "&format=json";
 
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
 
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String line;
            StringBuilder response = new StringBuilder();
 
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();  // This closes stream and conn
 
            return response.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
 
 
    /**
     * Returns a List of Strings that could be the possible location. Useful for auto suggestions.
     * @param address The address to query.
     * @return LocationDTO
    */
    public LocationDTO getAddressAndCoordinates(String address){
        try {
            // Example search
            String searchResult = requestNominatimLocation(address);
 
            // Parse the JSON response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode resultsArray = mapper.readTree(searchResult);
 
            // Nominatim search returns an array of results
            if (resultsArray.isArray() && resultsArray.size() > 0) {
                JsonNode firstResult = resultsArray.get(0);
 
                // Extract the fields
                return new LocationDTO(
                    firstResult.get("display_name").asText(),
                    firstResult.get("lat").asDouble(),
                    firstResult.get("lon").asDouble(),
                    "Location found. " + firstResult.get("display_name").asText(),
                    "#000000"
                );
            } else {
                return new LocationDTO(null, null, null, "Location not found", "#FF0000");
            }
 
        } catch (Exception e) {
            e.printStackTrace();
            return new LocationDTO(null, null, null, "Server side error occurred", "#FF0000");
        }
    }
}