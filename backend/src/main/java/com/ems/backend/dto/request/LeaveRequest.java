package com.ems.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequest {
    @NotNull
    private Long employeeId;

    @NotNull
    private String leaveType; // SICK, CASUAL, ANNUAL, MATERNITY, PATERNITY, UNPAID, BEREAVEMENT

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String reason;
}
