package org.example.cat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cat.dto.ProjectCreateRequest;
import org.example.cat.entity.Project;
import org.example.cat.entity.User;
import org.example.cat.repository.ProjectRepository;
import org.example.cat.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public Project createProject(ProjectCreateRequest request) {
        log.info("Creating project '{}' for userId: {}", request.getName(), request.getUserId());
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));

        Project project = Project.builder()
                .name(request.getName())
                .data(request.getData())
                .user(user)
                .build();

        Project saved = projectRepository.save(project);
        log.info("Project created with id: {}", saved.getId());
        
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Project> getProjectsByUserId(Long userId) {
        log.info("Fetching projects for userId: {}", userId);
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        return projectRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteProject(Long id) {
        log.info("Deleting project with id: {}", id);
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
        log.info("Project deleted successfully: {}", id);
    }
}
