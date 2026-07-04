package com.ems.backend.dto.response;

import com.ems.backend.entity.Leave;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private Long approvedById;
    private String approvedByName;
    private String reviewerComment;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;

    public static LeaveResponse from(Leave leave) {
        LeaveResponse dto = new LeaveResponse();
        dto.setId(leave.getId());
        if (leave.getEmployee() != null) {
            dto.setEmployeeId(leave.getEmployee().getId());
            dto.setEmployeeName(leave.getEmployee().getFullName());
        }
        dto.setLeaveType(leave.getLeaveType() != null ? leave.getLeaveType().name() : null);
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setReason(leave.getReason());
        dto.setStatus(leave.getStatus() != null ? leave.getStatus().name() : null);
        if (leave.getApprovedBy() != null) {
            dto.setApprovedById(leave.getApprovedBy().getId());
            dto.setApprovedByName(leave.getApprovedBy().getFullName());
        }
        dto.setReviewerComment(leave.getReviewerComment());
        dto.setAppliedAt(leave.getAppliedAt());
        dto.setReviewedAt(leave.getReviewedAt());
        return dto;
    }
}
