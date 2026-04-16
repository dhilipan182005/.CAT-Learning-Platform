package org.example.cat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cat.dto.HistorySaveRequest;
import org.example.cat.entity.History;
import org.example.cat.entity.User;
import org.example.cat.repository.HistoryRepository;
import org.example.cat.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HistoryService {
    private final HistoryRepository historyRepository;
    private final UserRepository userRepository;

    @Transactional
    public History saveHistory(HistorySaveRequest request) {
        log.info("Saving history for userId: {}, type: {}", request.getUserId(), request.getCalculationType());
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));

        History history = History.builder()
                .calculationType(request.getCalculationType())
                .inputData(request.getInputData())
                .result(request.getResult())
                .user(user)
                .build();

        History saved = historyRepository.save(history);
        log.info("History saved with id: {}", saved.getId());
        
        return saved;
    }

    @Transactional(readOnly = true)
    public List<History> getHistoryByUserId(Long userId) {
        log.info("Fetching history for userId: {}", userId);
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        return historyRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
