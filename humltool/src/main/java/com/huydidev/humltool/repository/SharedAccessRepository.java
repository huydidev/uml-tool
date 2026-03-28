package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.SharedAccessEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SharedAccessRepository extends MongoRepository<SharedAccessEntity, String> {
    Optional<SharedAccessEntity> findByDiagramIdAndUserId(String diagramId, String userId);

    List<SharedAccessEntity> findByDiagramId(String diagramId);

    List<SharedAccessEntity> findByUserId(String userId);

    void deleteByDiagramIdAndUserId(String diagramId, String userId);
}
