package com.ems.backend.service;

import com.ems.backend.dto.request.LeaveRequest;
import com.ems.backend.dto.request.LeaveReviewRequest;
import com.ems.backend.entity.Employee;
import com.ems.backend.entity.Leave;
import com.ems.backend.exception.BadRequestException;
import com.ems.backend.exception.ResourceNotFoundException;
import com.ems.backend.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeService employeeService;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public List<Leave> getAll() {
        return leaveRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Leave> getForEmployee(Long employeeId) {
        return leaveRepository.findByEmployeeId(employeeId);
    }

    @Transactional(readOnly = true)
    public List<Leave> getPending() {
        return leaveRepository.findByStatus(Leave.LeaveStatus.PENDING);
    }

    @Transactional
    public Leave apply(LeaveRequest request) {
        Employee employee = employeeService.findEntity(request.getEmployeeId());

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        Leave leave = Leave.builder()
                .employee(employee)
                .leaveType(Leave.LeaveType.valueOf(request.getLeaveType()))
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .status(Leave.LeaveStatus.PENDING)
                .build();

        leave = leaveRepository.save(leave);

        activityLogService.record("LEAVE_APPLIED", "Leave", leave.getId(),
                employee.getFullName() + " applied for " + leave.getLeaveType() + " leave");

        return leave;
    }

    @Transactional
    public Leave review(Long leaveId, LeaveReviewRequest request) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + leaveId));

        Leave.LeaveStatus decision;
        try {
            decision = Leave.LeaveStatus.valueOf(request.getDecision());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Decision must be APPROVED or REJECTED");
        }

        if (decision != Leave.LeaveStatus.APPROVED && decision != Leave.LeaveStatus.REJECTED) {
            throw new BadRequestException("Decision must be APPROVED or REJECTED");
        }

        leave.setStatus(decision);
        leave.setReviewerComment(request.getComment());
        leave.setReviewedAt(LocalDateTime.now());

        if (request.getReviewerEmployeeId() != null) {
            leave.setApprovedBy(employeeService.findEntity(request.getReviewerEmployeeId()));
        }

        leave = leaveRepository.save(leave);

        activityLogService.record("LEAVE_REVIEWED", "Leave", leave.getId(),
                "Leave request " + decision.name().toLowerCase());

        return leave;
    }

    @Transactional
    public Leave cancel(Long leaveId) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + leaveId));

        if (leave.getStatus() != Leave.LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be cancelled");
        }

        leave.setStatus(Leave.LeaveStatus.CANCELLED);
        leave = leaveRepository.save(leave);

        activityLogService.record("LEAVE_CANCELLED", "Leave", leave.getId(), "Leave request cancelled");

        return leave;
    }
}
