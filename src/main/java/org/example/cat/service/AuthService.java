package org.example.cat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cat.dto.AuthResponse;
import org.example.cat.dto.LoginRequest;
import org.example.cat.dto.RegisterRequest;
import org.example.cat.entity.User;
import org.example.cat.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request == null || request.getUsername() == null || request.getPassword() == null) {
            throw new RuntimeException("Registration data is missing required fields");
        }

        log.info("Registering user: {}", request.getUsername());
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        log.info("Creating user entity for: {}", request.getUsername());
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        log.info("Saving user to database...");
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());
        return new AuthResponse(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), "Registration success");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        if (request == null || request.getUsername() == null || request.getPassword() == null) {
            log.error("Login attempt failed: Missing username or password");
            throw new RuntimeException("Username and password are required");
        }

        String username = request.getUsername();
        log.info("Attempting login for user: {}", username);
        
        Optional<User> userOptional = userRepository.findByUsername(username);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            log.info("User found in DB: {} (ID: {})", username, user.getId());
            
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.info("Password verification SUCCESS for user: {}", username);
                return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), "Login success");
            } else {
                log.error("Password verification FAILED for user: {}", username);
                throw new RuntimeException("Invalid password");
            }
        } else {
            log.error("Login lookup FAILED: Username '{}' not found in database", username);
            throw new RuntimeException("User not found");
        }
    }
}