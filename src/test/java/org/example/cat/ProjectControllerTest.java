package org.example.cat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.cat.dto.ProjectCreateRequest;
import org.example.cat.entity.User;
import org.example.cat.repository.ProjectRepository;
import org.example.cat.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long testUserId;

    @BeforeEach
    void setup() {
        projectRepository.deleteAll();
        userRepository.deleteAll();

        User user = User.builder()
                .username("dhilip")
                .email("dhilip@example.com")
                .password(passwordEncoder.encode("1234"))
                .build();
        testUserId = userRepository.save(user).getId();
    }

    @Test
    @Order(1)
    @DisplayName("POST /api/project — create project success")
    void testCreateProject() throws Exception {
        ProjectCreateRequest request = new ProjectCreateRequest();
        request.setUserId(testUserId);
        request.setName("Circuit Simulation 1");
        request.setData("{\"components\": [\"resistor\", \"capacitor\"]}");

        mockMvc.perform(post("/api/project")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Project created successfully"))
                .andExpect(jsonPath("$.data.name").value("Circuit Simulation 1"));
    }

    @Test
    @Order(2)
    @DisplayName("GET /api/project/user/{userId} — fetch projects")
    void testGetProjectsByUser() throws Exception {
        // Create a project first
        ProjectCreateRequest request = new ProjectCreateRequest();
        request.setUserId(testUserId);
        request.setName("Test Project");
        request.setData("{}");

        mockMvc.perform(post("/api/project")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Fetch projects
        mockMvc.perform(get("/api/project/user/" + testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(3)
    @DisplayName("POST /api/project — user not found returns 400")
    void testCreateProjectUserNotFound() throws Exception {
        ProjectCreateRequest request = new ProjectCreateRequest();
        request.setUserId(99999L);
        request.setName("Ghost Project");
        request.setData("{}");

        mockMvc.perform(post("/api/project")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
