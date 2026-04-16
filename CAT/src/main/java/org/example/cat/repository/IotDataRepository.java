package org.example.cat.repository;

import org.example.cat.entity.IotData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IotDataRepository extends JpaRepository<IotData, Long> {
    List<IotData> findByUserIdOrderByCreatedAtDesc(Long userId);
}
