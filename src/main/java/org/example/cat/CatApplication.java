package org.example.cat;

import org.example.cat.entity.User;
import org.example.cat.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class CatApplication {

    public static void main(String[] args) {
        SpringApplication.run(CatApplication.class, args);
    }

    @Bean
    public CommandLineRunner dataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("dhilip")) {
                User user = User.builder()
                        .username("dhilip")
                        .email("dhilip@example.com")
                        .password(passwordEncoder.encode("1234"))
                        .build();
                userRepository.save(user);
                System.out.println("Default user 'dhilip' created with password '1234'");
            }
        };
    }
}
