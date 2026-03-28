package com.huydidev.humltool.service;

import com.huydidev.humltool.model.VersionModel;

import java.util.List;

public interface DiagramVersionService {
    VersionModel saveVersion(String diagramId, String label, String token);
    List<VersionModel> getHistory(String diagramId);
}
