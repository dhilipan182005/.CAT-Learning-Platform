package org.example.cat.dto;

public class AuthResponse {
    private Long id;
    private String username;
    private String email;
    private String message;

    public AuthResponse() {}

    // For login success
    public AuthResponse(String username, String message) {
        this.username = username;
        this.message = message;
    }

    // For registration success (or legacy login)
    public AuthResponse(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    // Full constructor
    public AuthResponse(Long id, String username, String email, String message) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
