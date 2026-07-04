package com.ems.backend.repository;

import com.ems.backend.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployeeId(Long employeeId);
    List<Payroll> findByPayPeriod(String payPeriod);
    Optional<Payroll> findByEmployeeIdAndPayPeriod(Long employeeId, String payPeriod);
}
