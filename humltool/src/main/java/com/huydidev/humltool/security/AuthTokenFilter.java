package com.huydidev.humltool.security;

import com.huydidev.humltool.config.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Autowired private JwtUtils jwtUtils;
    @Autowired private StringRedisTemplate redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if(jwt != null){
                // Check Redis
                if(Boolean.TRUE.equals(redisTemplate.hasKey(jwt))){
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setHeader("Content-Type", "text/plain;charset=UTF-8");
                    response.getWriter().write("Token đã bị thu hồi");
                    return;
                }

                // Validate JWT
                if(jwtUtils.validateJwtToken(jwt)){
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                }
            }
        }
        catch (Exception e){
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request){
        String headerAuth = request.getHeader("Authorization");
        if(headerAuth != null && headerAuth.startsWith("Bearer ")){
            return headerAuth.substring(7);
        }
        return null;
    }
}