package org.example.cat.repository;

import org.example.cat.entity.Iot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IotRepository extends JpaRepository<Iot, Long> {
    List<Iot> findByUserIdOrderByTimestampDesc(Long userId);
}
