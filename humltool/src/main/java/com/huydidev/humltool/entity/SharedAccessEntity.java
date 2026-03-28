package com.huydidev.humltool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "shared_access")
@CompoundIndex(name = "diag_user_idx", def = "{'diagramId': 1, 'userId': 1}", unique = true)
public class SharedAccessEntity {
    @Id
    private String id;

    @Indexed
    private String diagramId;

    @Indexed
    private String userId;

    private String role;
    private LocalDateTime grantedAt = LocalDateTime.now();
}
