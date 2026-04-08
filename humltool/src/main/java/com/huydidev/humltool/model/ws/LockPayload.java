package com.huydidev.humltool.model.ws;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LockPayload {
    private String nodeId;
    private String userId;
    private String color;
}