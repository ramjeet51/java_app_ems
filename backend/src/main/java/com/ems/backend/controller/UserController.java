package com.ems.backend.controller;

import com.ems.backend.dto.response.UserResponse;
import com.ems.backend.entity.Role;
import com.ems.backend.entity.User;
import com.ems.backend.repository.UserRepository;
import com.ems.backend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin-only user/account management. Restricted entirely via SecurityConfig (/users/** -> ROLE_ADMIN).
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/{id}/toggle-enabled")
    public ResponseEntity<ApiResponse<UserResponse>> toggleEnabled(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.ems.backend.exception.ResourceNotFoundException("User not found: " + id));
        user.setEnabled(!user.isEnabled());
        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(toResponse(user)));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet()))
                .employeeId(user.getEmployee() != null ? user.getEmployee().getId() : null)
                .build();
    }
}
