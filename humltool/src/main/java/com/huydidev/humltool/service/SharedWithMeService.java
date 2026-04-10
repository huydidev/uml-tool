package com.huydidev.humltool.service;

import com.huydidev.humltool.model.DiagramModel;
import java.util.List;

public interface SharedWithMeService {
    List<DiagramModel> getSharedWithMe(String token);
}