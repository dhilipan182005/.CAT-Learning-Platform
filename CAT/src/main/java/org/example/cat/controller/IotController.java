package org.example.cat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cat.dto.ApiResponse;
import org.example.cat.dto.IotSaveRequest;
import org.example.cat.entity.Iot;
import org.example.cat.service.IotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
public class IotController {
    private final IotService iotService;

    @PostMapping
    public ResponseEntity<ApiResponse<Iot>> saveSimulation(@Valid @RequestBody IotSaveRequest request) {
        Iot simulation = iotService.saveSimulation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Simulation saved successfully", simulation));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Iot>>> getSimulations(@PathVariable Long userId) {
        List<Iot> simulations = iotService.getIntegrationsByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Simulations fetched successfully", simulations));
    }
}
