package org.example.cat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProjectCreateRequest {
    @NotNull(message = "User ID must be provided")
    private Long userId;

    @NotBlank(message = "Project name cannot be blank")
    private String name;

    private String data;
}
