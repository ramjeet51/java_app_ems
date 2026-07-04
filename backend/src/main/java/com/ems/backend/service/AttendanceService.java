package com.ems.backend.service;

import com.ems.backend.dto.request.AttendanceRequest;
import com.ems.backend.entity.Attendance;
import com.ems.backend.entity.Employee;
import com.ems.backend.exception.DuplicateResourceException;
import com.ems.backend.exception.ResourceNotFoundException;
import com.ems.backend.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeService employeeService;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public List<Attendance> getAll() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> getForEmployee(Long employeeId, LocalDate start, LocalDate end) {
        return attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, start, end);
    }

    public List<Attendance> getForDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date);
    }

    @Transactional
    public Attendance checkIn(AttendanceRequest request) {
        Employee employee = employeeService.findEntity(request.getEmployeeId());

        attendanceRepository.findByEmployeeIdAndAttendanceDate(employee.getId(), request.getAttendanceDate())
                .ifPresent(a -> { throw new DuplicateResourceException("Attendance already recorded for this date"); });

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .attendanceDate(request.getAttendanceDate())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .status(Attendance.AttendanceStatus.valueOf(request.getStatus()))
                .remarks(request.getRemarks())
                .build();

        attendance = attendanceRepository.save(attendance);
        activityLogService.record("ATTENDANCE_MARKED", "Attendance", attendance.getId(),
                employee.getFullName() + " marked " + attendance.getStatus() + " on " + attendance.getAttendanceDate());
        return attendance;
    }

    @Transactional
    public Attendance update(Long id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found: " + id));

        attendance.setCheckInTime(request.getCheckInTime());
        attendance.setCheckOutTime(request.getCheckOutTime());
        attendance.setStatus(Attendance.AttendanceStatus.valueOf(request.getStatus()));
        attendance.setRemarks(request.getRemarks());

        attendance = attendanceRepository.save(attendance);
        activityLogService.record("ATTENDANCE_UPDATED", "Attendance", attendance.getId(), "Attendance record updated");
        return attendance;
    }

    public double calculateAttendancePercentage(Long employeeId, LocalDate start, LocalDate end) {
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        long present = attendanceRepository.countByEmployeeIdAndStatusAndAttendanceDateBetween(
                employeeId, Attendance.AttendanceStatus.PRESENT, start, end);
        if (totalDays == 0) return 0;
        return Math.round((present * 10000.0 / totalDays)) / 100.0;
    }
}
