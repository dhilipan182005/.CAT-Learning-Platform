package org.example.cat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cat.dto.IotSaveRequest;
import org.example.cat.entity.Iot;
import org.example.cat.entity.User;
import org.example.cat.repository.IotRepository;
import org.example.cat.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IotService {
    private final IotRepository iotRepository;
    private final UserRepository userRepository;

    @Transactional
    public Iot saveSimulation(IotSaveRequest request) {
        log.info("Saving IoT simulation for userId: {}", request.getUserId());
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));

        Iot iot = Iot.builder()
                .data(request.getData())
                .user(user)
                .build();

        Iot saved = iotRepository.save(iot);
        log.info("IoT simulation saved with id: {}", saved.getId());
        
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Iot> getIntegrationsByUserId(Long userId) {
        log.info("Fetching IoT simulations for userId: {}", userId);
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        return iotRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
