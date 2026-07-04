package com.ems.backend.controller;

import com.ems.backend.dto.request.PerformanceReviewRequest;
import com.ems.backend.entity.PerformanceReview;
import com.ems.backend.service.PerformanceReviewService;
import com.ems.backend.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceReviewService performanceReviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PerformanceReview>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(performanceReviewService.getAll()));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<PerformanceReview>>> getForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(performanceReviewService.getForEmployee(employeeId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PerformanceReview>> create(@Valid @RequestBody PerformanceReviewRequest request) {
        PerformanceReview review = performanceReviewService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Performance review created", review));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PerformanceReview>> update(
            @PathVariable Long id, @Valid @RequestBody PerformanceReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Performance review updated", performanceReviewService.update(id, request)));
    }
}
