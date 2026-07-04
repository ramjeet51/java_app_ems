package com.ems.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private String employeeCode;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private String status;
    private LocalDate dateOfJoining;
    private LocalDate dateOfBirth;
    private BigDecimal baseSalary;
    private Long managerId;
    private String managerName;
    private String address;
    private String profileImageUrl;
}
