package com.ems.backend.repository;

import com.ems.backend.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable);
    Page<ActivityLog> findByActorEmailOrderByTimestampDesc(String actorEmail, Pageable pageable);
}
