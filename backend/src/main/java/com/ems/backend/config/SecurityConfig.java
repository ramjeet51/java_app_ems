package com.ems.backend.config;

import com.ems.backend.security.JwtAuthenticationEntryPoint;
import com.ems.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Stateless, JWT-based security configuration with role-based authorization rules.
 * Roles: ROLE_ADMIN, ROLE_HR, ROLE_MANAGER, ROLE_EMPLOYEE
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(eh -> eh.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                // Employee management - HR/Admin manage, Manager/Employee read scoped views
                .requestMatchers("DELETE", "/employees/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("POST", "/employees/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("PUT", "/employees/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("GET", "/employees/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Attendance
                .requestMatchers("/attendance/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Leaves
                .requestMatchers("POST", "/leaves/apply").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                .requestMatchers("PATCH", "/leaves/*/review").hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers("/leaves/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Payroll - restricted to Admin/HR for writes, employees can view their own
                .requestMatchers("POST", "/payroll/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("PUT", "/payroll/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("DELETE", "/payroll/**").hasAnyRole("ADMIN")
                .requestMatchers("GET", "/payroll/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Performance reviews
                .requestMatchers("POST", "/performance/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers("PUT", "/performance/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers("GET", "/performance/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Activity logs - Admin/HR only
                .requestMatchers("/logs/**").hasAnyRole("ADMIN", "HR")

                // Reports/dashboard - Admin/HR/Manager
                .requestMatchers("/reports/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Users/roles management - Admin only
                .requestMatchers("/users/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
