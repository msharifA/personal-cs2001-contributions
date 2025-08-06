package com.example.reusemedb.controller;
 
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
 
import com.example.reusemedb.service.GeoCodingService;
import com.example.reusemedb.DTO.LocationDTO;
 
 
@RestController
@RequestMapping("/api/geocoding")
public class GeoCodingController {
 
    GeoCodingService geoCoder;
 
    GeoCodingController(GeoCodingService geoCoder){  // Alternative to @Autowired
        this.geoCoder = geoCoder;
    }
 
    @GetMapping("search")
    public ResponseEntity<?> getLocationSuggestion(@RequestParam String query) {
        try{
            LocationDTO location = geoCoder.getAddressAndCoordinates(query);
            return ResponseEntity.ok(location);
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
 
}