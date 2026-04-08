package com.huydidev.humltool.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private AuthChannelInterceptor authChannelInterceptor;

    // ── Cấu hình broker ───────────────────────────────────────────────
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // FE subscribe các topic từ server
        registry.enableSimpleBroker("/topic", "/queue");

        // FE gửi message lên server qua prefix /app
        registry.setApplicationDestinationPrefixes("/app");

        // Server gửi message riêng cho từng user
        registry.setUserDestinationPrefix("/user");
    }

    // ── Endpoint connect ─────────────────────────────────────────────
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // dev — production nên giới hạn
                .withSockJS();                  // fallback cho browser không support WS native
    }

    // ── Gắn JWT interceptor vào inbound channel ──────────────────────
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(authChannelInterceptor);
    }
}