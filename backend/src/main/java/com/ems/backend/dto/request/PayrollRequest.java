package com.ems.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PayrollRequest {
    @NotNull
    private Long employeeId;

    @NotBlank
    private String payPeriod; // YYYY-MM

    @NotNull
    private BigDecimal basicSalary;

    private BigDecimal allowances;
    private BigDecimal bonus;
    private BigDecimal deductions;
    private BigDecimal tax;
}
