package com.huydidev.humltool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
//import org.springframework.stereotype.Indexed;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Set;

@Document(collection = "users")
@Data

public class UserEntity {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String name;

    private String passwordHash;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Set<String> roles = Collections.singleton("ROLE_USER");

}
