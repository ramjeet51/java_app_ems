package com.ems.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

/**
 * Smoke test verifying the Spring context loads with an in-memory-friendly config.
 * Point DB_HOST/etc at a real or test MySQL instance to run this (see .env.example).
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class EmployeeManagementApplicationTests {

    @Test
    void contextLoads() {
    }
}
