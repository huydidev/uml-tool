// src/main/java/com/huydidev/humltool/constants/WorkspaceRoles.java

package com.huydidev.humltool.constants;

public final class WorkspaceRoles {

    private WorkspaceRoles() {}

    // Roles
    public static final String OWNER   = "OWNER";
    public static final String TEACHER = "TEACHER";
    public static final String STUDENT = "STUDENT";
    public static final String MEMBER  = "MEMBER";

    // Status
    public static final String ACTIVE  = "ACTIVE";
    public static final String PENDING = "PENDING";

    // Workspace types
    public static final String TEAM      = "TEAM";
    public static final String CLASSROOM = "CLASSROOM";

    // Grade visible
    public static final String SELF_ONLY = "SELF_ONLY";
    public static final String ALL       = "ALL";

    // Invite status
    public static final String ACCEPTED = "ACCEPTED";
    public static final String REJECTED = "REJECTED";
}