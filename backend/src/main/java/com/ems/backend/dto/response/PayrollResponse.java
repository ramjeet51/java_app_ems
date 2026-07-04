package com.ems.backend.dto.response;

import com.ems.backend.entity.Payroll;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PayrollResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String payPeriod;
    private BigDecimal basicSalary;
    private BigDecimal allowances;
    private BigDecimal bonus;
    private BigDecimal deductions;
    private BigDecimal tax;
    private BigDecimal netSalary;
    private String status;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;

    public static PayrollResponse from(Payroll p) {
        PayrollResponse dto = new PayrollResponse();
        dto.setId(p.getId());
        if (p.getEmployee() != null) {
            dto.setEmployeeId(p.getEmployee().getId());
            dto.setEmployeeName(p.getEmployee().getFullName());
        }
        dto.setPayPeriod(p.getPayPeriod());
        dto.setBasicSalary(p.getBasicSalary());
        dto.setAllowances(p.getAllowances());
        dto.setBonus(p.getBonus());
        dto.setDeductions(p.getDeductions());
        dto.setTax(p.getTax());
        dto.setNetSalary(p.getNetSalary());
        dto.setStatus(p.getStatus() != null ? p.getStatus().name() : null);
        dto.setProcessedAt(p.getProcessedAt());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
