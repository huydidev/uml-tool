package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.model.ws.UserPayload;
import com.huydidev.humltool.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class RoomServiceImpl implements RoomService {

    // TTL room user: 60s, reset khi có activity
    private static final Duration ROOM_TTL = Duration.ofSeconds(60);

    // Palette màu — assign theo thứ tự join
    private static final List<String> COLOR_PALETTE = List.of(
            "#3b82f6",  // blue
            "#8b5cf6",  // violet
            "#f59e0b",  // amber
            "#ef4444",  // red
            "#10b981",  // emerald
            "#ec4899",  // pink
            "#06b6d4",  // cyan
            "#f97316"   // orange
    );

    @Autowired
    private StringRedisTemplate redisTemplate;

    // ── Key helpers ───────────────────────────────────────────────────
    // room:diagram:{diagramId}:user:{userId} → userName
    private String userKey(String diagramId, String userId) {
        return "room:diagram:" + diagramId + ":user:" + userId;
    }

    // room:diagram:{diagramId}:color:{userId} → color
    private String colorKey(String diagramId, String userId) {
        return "room:diagram:" + diagramId + ":color:" + userId;
    }

    // room:diagram:{diagramId}:user:* — prefix để scan tất cả users
    private String userPrefix(String diagramId) {
        return "room:diagram:" + diagramId + ":user:*";
    }

    // ── Join room ─────────────────────────────────────────────────────
    @Override
    public UserPayload joinRoom(String diagramId, String userId, String userName) {
        // Assign màu dựa theo số user hiện tại trong room
        List<UserPayload> current = getOnlineUsers(diagramId);
        String color = COLOR_PALETTE.get(current.size() % COLOR_PALETTE.size());

        // Lưu userName + color vào Redis với TTL
        redisTemplate.opsForValue().set(userKey(diagramId, userId), userName, ROOM_TTL);
        redisTemplate.opsForValue().set(colorKey(diagramId, userId), color, ROOM_TTL);

        return UserPayload.builder()
                .userId(userId)
                .userName(userName)
                .color(color)
                .build();
    }

    // ── Leave room ────────────────────────────────────────────────────
    @Override
    public void leaveRoom(String diagramId, String userId) {
        redisTemplate.delete(userKey(diagramId, userId));
        redisTemplate.delete(colorKey(diagramId, userId));
    }

    // ── Lấy danh sách online users ────────────────────────────────────
    @Override
    public List<UserPayload> getOnlineUsers(String diagramId) {
        Set<String> keys = redisTemplate.keys(userPrefix(diagramId));
        List<UserPayload> users = new ArrayList<>();
        if (keys == null) return users;

        for (String key : keys) {
            String userName = redisTemplate.opsForValue().get(key);
            if (userName == null) continue;

            // Extract userId từ key: room:diagram:{id}:user:{userId}
            String userId = key.substring(key.lastIndexOf(":user:") + 6);
            String color  = redisTemplate.opsForValue().get(colorKey(diagramId, userId));

            users.add(UserPayload.builder()
                    .userId(userId)
                    .userName(userName)
                    .color(color != null ? color : COLOR_PALETTE.get(0))
                    .build());
        }
        return users;
    }

    // ── Kiểm tra user có trong room không ────────────────────────────
    @Override
    public boolean isInRoom(String diagramId, String userId) {
        return Boolean.TRUE.equals(
                redisTemplate.hasKey(userKey(diagramId, userId))
        );
    }

    // ── Reset TTL khi user có activity ───────────────────────────────
    public void refreshTTL(String diagramId, String userId) {
        redisTemplate.expire(userKey(diagramId, userId), ROOM_TTL);
        redisTemplate.expire(colorKey(diagramId, userId), ROOM_TTL);
    }

    // ── Lấy màu của 1 user trong room ────────────────────────────────
    public String getUserColor(String diagramId, String userId) {
        String color = redisTemplate.opsForValue().get(colorKey(diagramId, userId));
        return color != null ? color : COLOR_PALETTE.get(0);
    }
}