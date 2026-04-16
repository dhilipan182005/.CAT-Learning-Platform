package org.example.cat.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HistoryDTO {
    private Long id;
    private Long userId;
    private String type;
    private String result;
    private LocalDateTime createdAt;
}
