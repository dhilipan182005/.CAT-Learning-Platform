package org.example.cat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IotSaveRequest {
    @NotNull(message = "User ID must be provided")
    private Long userId;

    @NotBlank(message = "Data cannot be empty")
    private String data;
}
