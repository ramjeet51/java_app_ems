package com.ems.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceRequest {
    @NotNull
    private Long employeeId;

    @NotNull
    private LocalDate attendanceDate;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;

    @NotNull
    private String status; // PRESENT, ABSENT, HALF_DAY, WORK_FROM_HOME, ON_LEAVE, HOLIDAY

    private String remarks;
}
