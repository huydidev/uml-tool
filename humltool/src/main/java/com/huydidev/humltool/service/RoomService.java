package com.huydidev.humltool.service;

import com.huydidev.humltool.model.ws.UserPayload;

import java.util.List;

public interface RoomService {

    // User join room — assign màu, lưu vào Redis
    UserPayload joinRoom(String diagramId, String userId, String userName);

    // User leave room — xóa khỏi Redis
    void leaveRoom(String diagramId, String userId);

    // Lấy danh sách users đang online trong room
    List<UserPayload> getOnlineUsers(String diagramId);

    // Kiểm tra user có trong room không
    boolean isInRoom(String diagramId, String userId);
}