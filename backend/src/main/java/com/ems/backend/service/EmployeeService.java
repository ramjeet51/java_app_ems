package com.ems.backend.service;

import com.ems.backend.dto.request.EmployeeRequest;
import com.ems.backend.dto.response.EmployeeResponse;
import com.ems.backend.entity.Employee;
import com.ems.backend.exception.DuplicateResourceException;
import com.ems.backend.exception.ResourceNotFoundException;
import com.ems.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ActivityLogService activityLogService;

    public List<EmployeeResponse> getAll() {
        return employeeRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public EmployeeResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public Employee findEntity(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    public List<EmployeeResponse> search(String query) {
        return employeeRepository.search(query).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An employee with this email already exists");
        }

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = findEntity(request.getManagerId());
        }

        Employee employee = Employee.builder()
                .employeeCode(generateEmployeeCode())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .status(parseStatus(request.getStatus()))
                .dateOfJoining(request.getDateOfJoining())
                .dateOfBirth(request.getDateOfBirth())
                .baseSalary(request.getBaseSalary())
                .manager(manager)
                .address(request.getAddress())
                .profileImageUrl(request.getProfileImageUrl())
                .build();

        employee = employeeRepository.save(employee);

        activityLogService.record("EMPLOYEE_CREATED", "Employee", employee.getId(),
                "Created employee " + employee.getFullName());

        return toResponse(employee);
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = findEntity(id);

        if (!employee.getEmail().equalsIgnoreCase(request.getEmail())
                && employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An employee with this email already exists");
        }

        Employee manager = request.getManagerId() != null ? findEntity(request.getManagerId()) : null;

        employee.setFullName(request.getFullName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());
        employee.setStatus(parseStatus(request.getStatus()));
        employee.setDateOfJoining(request.getDateOfJoining());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setBaseSalary(request.getBaseSalary());
        employee.setManager(manager);
        employee.setAddress(request.getAddress());
        employee.setProfileImageUrl(request.getProfileImageUrl());

        employee = employeeRepository.save(employee);

        activityLogService.record("EMPLOYEE_UPDATED", "Employee", employee.getId(),
                "Updated employee " + employee.getFullName());

        return toResponse(employee);
    }

    @Transactional
    public void delete(Long id) {
        Employee employee = findEntity(id);
        employeeRepository.delete(employee);
        activityLogService.record("EMPLOYEE_DELETED", "Employee", id,
                "Deleted employee " + employee.getFullName());
    }

    private Employee.EmploymentStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return Employee.EmploymentStatus.ACTIVE;
        return Employee.EmploymentStatus.valueOf(status);
    }

    private static final AtomicInteger SEQ = new AtomicInteger(1000);

    private String generateEmployeeCode() {
        return "EMP-" + Year.now().getValue() + "-" + SEQ.incrementAndGet();
    }

    private EmployeeResponse toResponse(Employee e) {
        return EmployeeResponse.builder()
                .id(e.getId())
                .employeeCode(e.getEmployeeCode())
                .fullName(e.getFullName())
                .email(e.getEmail())
                .phone(e.getPhone())
                .department(e.getDepartment())
                .designation(e.getDesignation())
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .dateOfJoining(e.getDateOfJoining())
                .dateOfBirth(e.getDateOfBirth())
                .baseSalary(e.getBaseSalary())
                .managerId(e.getManager() != null ? e.getManager().getId() : null)
                .managerName(e.getManager() != null ? e.getManager().getFullName() : null)
                .address(e.getAddress())
                .profileImageUrl(e.getProfileImageUrl())
                .build();
    }
}
