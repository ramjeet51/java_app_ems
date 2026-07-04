package com.ems.backend.service;

import com.ems.backend.dto.request.PayrollRequest;
import com.ems.backend.entity.Employee;
import com.ems.backend.entity.Payroll;
import com.ems.backend.exception.DuplicateResourceException;
import com.ems.backend.exception.ResourceNotFoundException;
import com.ems.backend.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeService employeeService;
    private final ActivityLogService activityLogService;

    public List<Payroll> getAll() {
        return payrollRepository.findAll();
    }

    public List<Payroll> getForEmployee(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId);
    }

    public List<Payroll> getForPeriod(String period) {
        return payrollRepository.findByPayPeriod(period);
    }

    @Transactional
    public Payroll process(PayrollRequest request) {
        Employee employee = employeeService.findEntity(request.getEmployeeId());

        payrollRepository.findByEmployeeIdAndPayPeriod(employee.getId(), request.getPayPeriod())
                .ifPresent(p -> { throw new DuplicateResourceException(
                        "Payroll for " + request.getPayPeriod() + " already exists for this employee"); });

        BigDecimal allowances = nz(request.getAllowances());
        BigDecimal bonus = nz(request.getBonus());
        BigDecimal deductions = nz(request.getDeductions());
        BigDecimal tax = nz(request.getTax());

        BigDecimal net = request.getBasicSalary()
                .add(allowances)
                .add(bonus)
                .subtract(deductions)
                .subtract(tax);

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .payPeriod(request.getPayPeriod())
                .basicSalary(request.getBasicSalary())
                .allowances(allowances)
                .bonus(bonus)
                .deductions(deductions)
                .tax(tax)
                .netSalary(net)
                .status(Payroll.PayrollStatus.PROCESSED)
                .processedAt(LocalDateTime.now())
                .build();

        payroll = payrollRepository.save(payroll);
        activityLogService.record("PAYROLL_PROCESSED", "Payroll", payroll.getId(),
                "Processed payroll for " + employee.getFullName() + " (" + request.getPayPeriod() + ")");
        return payroll;
    }

    @Transactional
    public Payroll markPaid(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found: " + payrollId));
        payroll.setStatus(Payroll.PayrollStatus.PAID);
        payroll = payrollRepository.save(payroll);
        activityLogService.record("PAYROLL_PAID", "Payroll", payroll.getId(), "Marked payroll as paid");
        return payroll;
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}
