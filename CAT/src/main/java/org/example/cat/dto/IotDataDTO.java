package org.example.cat.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class IotDataDTO {
    private Long id;
    private Long userId;
    private String sensorType;
    private String value;
    private LocalDateTime createdAt;
}
