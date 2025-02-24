package com.king.backend.domain.curation.entity;

import com.king.backend.search.service.SyncService;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurationListListener {

    @Autowired
    private static SyncService syncService;

    @Autowired
    public void setSyncService(SyncService syncService) {
        CurationListListener.syncService = syncService;
    }

    @PostPersist
    @PostUpdate
    public void preSave(CurationList curationList) {
        syncService.updateCurationList(curationList);
    }

    @PostRemove
    public void postRemove(CurationList curationList) {
        syncService.deleteCurationList(curationList.getId());
    }
}
