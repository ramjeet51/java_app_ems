package com.ems.backend.service;

import com.ems.backend.dto.request.LoginRequest;
import com.ems.backend.dto.request.RegisterUserRequest;
import com.ems.backend.dto.response.AuthResponse;
import com.ems.backend.entity.Employee;
import com.ems.backend.entity.Role;
import com.ems.backend.entity.User;
import com.ems.backend.exception.BadRequestException;
import com.ems.backend.exception.DuplicateResourceException;
import com.ems.backend.exception.ResourceNotFoundException;
import com.ems.backend.repository.EmployeeRepository;
import com.ems.backend.repository.RoleRepository;
import com.ems.backend.repository.UserRepository;
import com.ems.backend.security.JwtUtil;
import com.ems.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ActivityLogService activityLogService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), principal.getAuthorities());

        activityLogService.record("LOGIN", "User", user.getId(), "User logged in");

        // Employee ID — agar user ke saath employee linked hai
        Long employeeId = (user.getEmployee() != null) ? user.getEmployee().getId() : null;

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresInMs(jwtUtil.getAccessTokenExpirationMs())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(principal.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toSet()))
                .employeeId(employeeId)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A user with this email already exists");
        }

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Role.RoleName parsed;
            try {
                parsed = Role.RoleName.valueOf(roleName);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Unknown role: " + roleName);
            }
            roles.add(roleRepository.findByName(parsed)
                    .orElseThrow(() -> new ResourceNotFoundException("Role not seeded: " + roleName)));
        }

        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + request.getEmployeeId()));
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .roles(roles)
                .employee(employee)
                .build();

        user = userRepository.save(user);

        activityLogService.record("USER_CREATED", "User", user.getId(),
                "Created user " + user.getEmail() + " with roles " + request.getRoles());

        Long empId = (employee != null) ? employee.getId() : null;

        return AuthResponse.builder()
                .accessToken(null)
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(request.getRoles())
                .employeeId(empId)
                .build();
    }
}
