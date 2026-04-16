package org.example.cat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.cat.dto.HistorySaveRequest;
import org.example.cat.entity.User;
import org.example.cat.repository.HistoryRepository;
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
class HistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HistoryRepository historyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long testUserId;

    @BeforeEach
    void setup() {
        historyRepository.deleteAll();
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
    @DisplayName("POST /api/history — save history success")
    void testSaveHistory() throws Exception {
        HistorySaveRequest request = new HistorySaveRequest();
        request.setUserId(testUserId);
        request.setCalculationType("OHM_LAW");
        request.setInputData("{\"V\": 12, \"R\": 4}");
        request.setResult("I = 3A");

        mockMvc.perform(post("/api/history")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Calculation history saved successfully"))
                .andExpect(jsonPath("$.data.calculationType").value("OHM_LAW"))
                .andExpect(jsonPath("$.data.result").value("I = 3A"));
    }

    @Test
    @Order(2)
    @DisplayName("GET /api/history/user/{userId} — fetch history")
    void testGetHistory() throws Exception {
        // Save first
        HistorySaveRequest request = new HistorySaveRequest();
        request.setUserId(testUserId);
        request.setCalculationType("POWER");
        request.setInputData("{\"V\": 10, \"I\": 2}");
        request.setResult("P = 20W");

        mockMvc.perform(post("/api/history")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Fetch
        mockMvc.perform(get("/api/history/user/" + testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].calculationType").value("POWER"));
    }

    @Test
    @Order(3)
    @DisplayName("POST /api/history — validation fail (blank calculationType)")
    void testSaveHistoryValidationFail() throws Exception {
        HistorySaveRequest request = new HistorySaveRequest();
        request.setUserId(testUserId);
        request.setCalculationType("");
        request.setInputData("{}");
        request.setResult("N/A");

        mockMvc.perform(post("/api/history")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
