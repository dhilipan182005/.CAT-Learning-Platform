package org.example.cat.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProjectDTO {
    private Long id;
    private Long userId;
    private String name;
    private String data;
    private LocalDateTime createdAt;
}
