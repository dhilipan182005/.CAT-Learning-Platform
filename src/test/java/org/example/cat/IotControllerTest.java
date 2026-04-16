package org.example.cat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.cat.dto.IotSaveRequest;
import org.example.cat.entity.User;
import org.example.cat.repository.IotRepository;
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
class IotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IotRepository iotRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long testUserId;

    @BeforeEach
    void setup() {
        iotRepository.deleteAll();
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
    @DisplayName("POST /api/iot — save IoT simulation success")
    void testSaveIotSimulation() throws Exception {
        IotSaveRequest request = new IotSaveRequest();
        request.setUserId(testUserId);
        request.setData("{\"temperature\": 25.5, \"humidity\": 60}");

        mockMvc.perform(post("/api/iot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Simulation saved successfully"))
                .andExpect(jsonPath("$.data.data").value("{\"temperature\": 25.5, \"humidity\": 60}"));
    }

    @Test
    @Order(2)
    @DisplayName("GET /api/iot/user/{userId} — fetch IoT simulations")
    void testGetIotSimulations() throws Exception {
        // Save first
        IotSaveRequest request = new IotSaveRequest();
        request.setUserId(testUserId);
        request.setData("{\"voltage\": 3.3}");

        mockMvc.perform(post("/api/iot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Fetch
        mockMvc.perform(get("/api/iot/user/" + testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(3)
    @DisplayName("POST /api/iot — validation fail (blank data)")
    void testSaveIotValidationFail() throws Exception {
        IotSaveRequest request = new IotSaveRequest();
        request.setUserId(testUserId);
        request.setData("");

        mockMvc.perform(post("/api/iot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
