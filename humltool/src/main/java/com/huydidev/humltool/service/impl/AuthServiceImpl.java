package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.dto.response.JwtResponse;
import com.huydidev.humltool.dto.request.LoginRequest;
import com.huydidev.humltool.dto.request.RegisterRequest;
import com.huydidev.humltool.dto.response.UserResponse;
import com.huydidev.humltool.entity.UserEntity;
import com.huydidev.humltool.repository.UserRepository;
import com.huydidev.humltool.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private StringRedisTemplate redisTemplate;

    @Override
    public UserResponse register(RegisterRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email đã được sử dụng!");
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.getEmail());

//       lấy đầu mail nếu name trống
        user.setName(request.getName()!= null ? request.getName():request.getEmail().split("@")[0]);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        UserEntity saved = userRepository.save(user);
        return new UserResponse(saved.getId(), saved.getEmail(), saved.getName());
    }

    @Override
    public JwtResponse login(LoginRequest request){
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())){
            throw new RuntimeException("Mật khẩu không chính xác");
        }

        String token = jwtUtils.generateToken(user);
        return new JwtResponse(token, new UserResponse(user.getId(), user.getEmail(), user.getName()));
    }

    @Override
    public void logout(String token){
        long expiration = 864000000;

        redisTemplate.opsForValue().set(token, "blacklisted", Duration.ofMillis(expiration));
    }
}
