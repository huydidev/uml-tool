package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.DiagramVersionEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;


public interface DiagramVersionRepository extends MongoRepository<DiagramVersionEntity, String> {
    List<DiagramVersionEntity> findByDiagramIdOrderByVersionNumDesc(String diagramId);
    DiagramVersionEntity findFirstByDiagramIdOrderByVersionNumDesc(String diagramId);
    long countByDiagramId(String diagramId);
    DiagramVersionEntity findFirstByDiagramIdOrderByVersionNumAsc(String diagramId);
}
