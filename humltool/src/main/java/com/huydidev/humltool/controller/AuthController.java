package com.huydidev.humltool.controller;

import com.huydidev.humltool.dto.LoginRequest;
import com.huydidev.humltool.dto.RegisterRequest;
import com.huydidev.humltool.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request){
        return ResponseEntity.ok(authService.register(request));
    }
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if(headerAuth!=null && headerAuth.startsWith("Bearer ")){
            String token = headerAuth.substring(7);
            authService.logout(token);
        }
        return ResponseEntity.ok("Bái bai");
    }
}
