package com.king.backend.domain.user.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatchUserRequestDTO {
    private String nickname;
    private String description;
    private Boolean contentAlarmOn;
    private String language;
}
