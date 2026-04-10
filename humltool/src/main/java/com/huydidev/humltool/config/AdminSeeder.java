package com.huydidev.humltool.config;

import com.huydidev.humltool.entity.UserEntity;
import com.huydidev.humltool.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Set;

@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    @Autowired private UserRepository  userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // Đọc từ application.properties — không hardcode password vào code
    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.name:Admin}")
    private String adminName;

    @Override
    public void run(ApplicationArguments args) {
        // Chỉ tạo nếu chưa tồn tại — idempotent, chạy bao nhiêu lần cũng an toàn
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin account already exists: {}", adminEmail);
            return;
        }

        UserEntity admin = new UserEntity();
        admin.setEmail(adminEmail);
        admin.setName(adminName);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRoles(Set.of("ROLE_USER", "ROLE_ADMIN"));
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());

        userRepository.save(admin);
        log.info("Admin account created: {}", adminEmail);
    }
}