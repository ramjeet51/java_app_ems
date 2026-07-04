package com.ems.backend.controller;

import com.ems.backend.dto.request.AttendanceRequest;
import com.ems.backend.entity.Attendance;
import com.ems.backend.service.AttendanceService;
import com.ems.backend.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Attendance>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getAll()));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<Attendance>>> getForEmployee(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getForEmployee(employeeId, start, end)));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<Attendance>>> getForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getForDate(date)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Attendance>> mark(@Valid @RequestBody AttendanceRequest request) {
        Attendance attendance = attendanceService.checkIn(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Attendance recorded", attendance));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Attendance>> update(
            @PathVariable Long id, @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Attendance updated", attendanceService.update(id, request)));
    }

    @GetMapping("/employee/{employeeId}/percentage")
    public ResponseEntity<ApiResponse<Map<String, Object>>> percentage(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        double pct = attendanceService.calculateAttendancePercentage(employeeId, start, end);
        return ResponseEntity.ok(ApiResponse.success(Map.of("attendancePercentage", pct)));
    }
}
