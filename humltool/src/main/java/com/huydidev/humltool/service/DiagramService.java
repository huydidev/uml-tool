package com.huydidev.humltool.service;

import com.huydidev.humltool.model.DiagramModel;
import java.util.List;

public interface DiagramService {
    DiagramModel saveDiagram(DiagramModel model, String token);
    List<DiagramModel> getAllDiagrams();
    List<DiagramModel> getMyDiagrams(String token);
    DiagramModel getDiagramById(String id);
    void deleteDiagram(String id);
}