package org.example.cat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cat.dto.ApiResponse;
import org.example.cat.dto.HistorySaveRequest;
import org.example.cat.entity.History;
import org.example.cat.service.HistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {
    private final HistoryService historyService;

    @PostMapping
    public ResponseEntity<ApiResponse<History>> saveHistory(@Valid @RequestBody HistorySaveRequest request) {
        History history = historyService.saveHistory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Calculation history saved successfully", history));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<History>>> getHistory(@PathVariable Long userId) {
        List<History> history = historyService.getHistoryByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "History fetched successfully", history));
    }
}
