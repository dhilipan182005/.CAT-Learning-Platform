package org.example.cat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cat.dto.ApiResponse;
import org.example.cat.dto.ProjectCreateRequest;
import org.example.cat.entity.Project;
import org.example.cat.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(@Valid @RequestBody ProjectCreateRequest request) {
        Project project = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Project created successfully", project));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Project>>> getProjects(@PathVariable Long userId) {
        List<Project> projects = projectService.getProjectsByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Projects fetched successfully", projects));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project deleted successfully", null));
    }
}
