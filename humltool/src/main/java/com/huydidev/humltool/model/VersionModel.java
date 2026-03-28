package com.huydidev.humltool.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VersionModel {
    private String id;
    private Integer versionNum;
    private String label;
    private String savedBy;
    private LocalDateTime savedAt;
}
