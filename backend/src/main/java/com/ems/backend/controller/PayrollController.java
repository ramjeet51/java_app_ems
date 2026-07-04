package com.ems.backend.controller;

import com.ems.backend.dto.request.PayrollRequest;
import com.ems.backend.dto.response.PayrollResponse;
import com.ems.backend.entity.Payroll;
import com.ems.backend.service.PayrollService;
import com.ems.backend.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getAll(
            @RequestParam(required = false) String period) {
        List<Payroll> result = (period == null || period.isBlank())
                ? payrollService.getAll()
                : payrollService.getForPeriod(period);
        List<PayrollResponse> dto = result.stream()
                .map(PayrollResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getForEmployee(
            @PathVariable Long employeeId) {
        List<PayrollResponse> dto = payrollService.getForEmployee(employeeId)
                .stream().map(PayrollResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PayrollResponse>> process(
            @Valid @RequestBody PayrollRequest request) {
        Payroll payroll = payrollService.process(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payroll processed", PayrollResponse.from(payroll)));
    }

    @PatchMapping("/{id}/mark-paid")
    public ResponseEntity<ApiResponse<PayrollResponse>> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payroll marked as paid",
                PayrollResponse.from(payrollService.markPaid(id))));
    }
}
