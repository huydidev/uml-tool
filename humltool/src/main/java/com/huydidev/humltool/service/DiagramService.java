package com.huydidev.humltool.service;

import com.huydidev.humltool.model.DiagramModel;
import java.util.List;

public interface DiagramService {
    DiagramModel saveDiagram(DiagramModel model);
    List<DiagramModel> getAllDiagrams();
    DiagramModel getDiagramById(String id);
}