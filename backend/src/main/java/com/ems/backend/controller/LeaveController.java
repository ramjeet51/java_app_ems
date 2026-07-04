package com.ems.backend.controller;

import com.ems.backend.dto.request.LeaveRequest;
import com.ems.backend.dto.request.LeaveReviewRequest;
import com.ems.backend.dto.response.LeaveResponse;
import com.ems.backend.entity.Leave;
import com.ems.backend.service.LeaveService;
import com.ems.backend.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getAll() {
        List<LeaveResponse> list = leaveService.getAll()
                .stream().map(LeaveResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getForEmployee(@PathVariable Long employeeId) {
        List<LeaveResponse> list = leaveService.getForEmployee(employeeId)
                .stream().map(LeaveResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getPending() {
        List<LeaveResponse> list = leaveService.getPending()
                .stream().map(LeaveResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<LeaveResponse>> apply(@Valid @RequestBody LeaveRequest request) {
        Leave leave = leaveService.apply(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave request submitted", LeaveResponse.from(leave)));
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<ApiResponse<LeaveResponse>> review(
            @PathVariable Long id, @Valid @RequestBody LeaveReviewRequest request) {
        Leave leave = leaveService.review(id, request);
        return ResponseEntity.ok(ApiResponse.success("Leave request reviewed", LeaveResponse.from(leave)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<LeaveResponse>> cancel(@PathVariable Long id) {
        Leave leave = leaveService.cancel(id);
        return ResponseEntity.ok(ApiResponse.success("Leave request cancelled", LeaveResponse.from(leave)));
    }
}
