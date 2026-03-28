package com.huydidev.humltool.service;

import com.huydidev.humltool.entity.DiagramVersionEntity;

import java.util.List;

public interface DiagramVersionService {
    DiagramVersionEntity saveVersion(String diagramId, String label, String token);
    List<DiagramVersionEntity> getHistory(String diagramId);
}
