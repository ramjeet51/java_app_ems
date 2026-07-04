package com.ems.backend.service;

import com.ems.backend.entity.ActivityLog;
import com.ems.backend.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Centralized write-side audit logging. Every meaningful mutation across the system
 * (employee CRUD, leave decisions, payroll runs, performance submissions, login) calls
 * record() so the activity_logs table reflects a complete trail.
 */
@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void record(String action, String entityType, Long entityId, String details) {
        String actorEmail = "system";
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            actorEmail = auth.getName();
        }

        ActivityLog log = ActivityLog.builder()
                .actorEmail(actorEmail)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();

        activityLogRepository.save(log);
    }

    public Page<ActivityLog> getRecentLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByTimestampDesc(pageable);
    }
}
