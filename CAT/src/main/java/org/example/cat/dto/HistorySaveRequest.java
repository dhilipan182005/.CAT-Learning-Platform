package org.example.cat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HistorySaveRequest {
    @NotNull(message = "User ID must be provided")
    private Long userId;

    @NotBlank(message = "Calculation type is required")
    private String calculationType;

    private String inputData;
    private String result;
}
