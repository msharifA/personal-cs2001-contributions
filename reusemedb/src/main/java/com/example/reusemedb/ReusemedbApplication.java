package com.example.reusemedb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EntityScan("com.example.reusemedb.model") 
public class ReusemedbApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReusemedbApplication.class, args);
	}

}
