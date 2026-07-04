package com.ems.backend.repository;

import com.ems.backend.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByEmployeeId(Long employeeId);
    List<Leave> findByStatus(Leave.LeaveStatus status);
    List<Leave> findByEmployeeIdAndStatus(Long employeeId, Leave.LeaveStatus status);
}
