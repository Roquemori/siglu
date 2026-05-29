package com.siglu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SigluApplication {
    public static void main(String[] args) {
        SpringApplication.run(SigluApplication.class, args);
    }
}
