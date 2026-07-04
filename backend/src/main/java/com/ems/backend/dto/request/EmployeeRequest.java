package com.ems.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeRequest {
    @NotBlank
    private String fullName;

    @NotBlank @Email
    private String email;

    private String phone;

    @NotBlank
    private String department;

    @NotBlank
    private String designation;

    private String status; // ACTIVE, ON_LEAVE, SUSPENDED, TERMINATED

    @NotNull
    private LocalDate dateOfJoining;

    private LocalDate dateOfBirth;

    @NotNull @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal baseSalary;

    private Long managerId;

    private String address;

    private String profileImageUrl;
}
