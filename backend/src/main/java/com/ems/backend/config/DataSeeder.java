package com.ems.backend.config;

import com.ems.backend.entity.Role;
import com.ems.backend.entity.User;
import com.ems.backend.repository.RoleRepository;
import com.ems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Seeds the four fixed roles and a default admin user on first boot.
 * Default credentials are read from .env (DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD)
 * and should be changed immediately after first login.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email}")
    private String defaultAdminEmail;

    @Value("${app.admin.default-password}")
    private String defaultAdminPassword;

    @Override
    public void run(String... args) {
        for (Role.RoleName roleName : Role.RoleName.values()) {
            roleRepository.findByName(roleName).orElseGet(() ->
                    roleRepository.save(Role.builder().name(roleName).build()));
        }

        if (!userRepository.existsByEmail(defaultAdminEmail)) {
            Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN).orElseThrow();
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);

            User admin = User.builder()
                    .fullName("System Administrator")
                    .email(defaultAdminEmail)
                    .password(passwordEncoder.encode(defaultAdminPassword))
                    .enabled(true)
                    .roles(roles)
                    .build();

            userRepository.save(admin);
            log.info("Seeded default admin account: {}", defaultAdminEmail);
        }
    }
}
