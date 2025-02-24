package com.king.backend.domain.user.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignUpResponseDTO {
    Long userId;
    String email;
    String nickname;
    String imageUrl;
    String language;
}
