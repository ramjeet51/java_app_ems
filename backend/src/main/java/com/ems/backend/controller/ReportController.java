package com.ems.backend.controller;

import com.ems.backend.dto.response.DashboardSummaryResponse;
import com.ems.backend.service.ReportService;
import com.ems.backend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDashboardSummary()));
    }
}
