package com.huydidev.humltool.model.ws;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorPayload {
    private String userId;
    private double x;
    private double y;
}