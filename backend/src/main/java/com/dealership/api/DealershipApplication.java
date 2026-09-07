package com.dealership.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class DealershipApplication {

    public static void main(String[] args) {
        SpringApplication.run(DealershipApplication.class, args);
    }
}
