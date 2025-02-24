package com.king.backend.domain.user.dto.domain;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

@Getter
@Setter
public class GoogleUserDTO {
    private String googleId;
    private String email;
    private String imageUrl;

    public static GoogleUserDTO from(OAuth2User oAuth2User) {
        Map<String, Object> attribute = oAuth2User.getAttributes();

        GoogleUserDTO googleUserDTO = new GoogleUserDTO();
        googleUserDTO.setGoogleId(attribute.get("sub").toString());
        googleUserDTO.setEmail(attribute.get("email").toString());

        if (attribute.containsKey("picture")) {
            googleUserDTO.setImageUrl(attribute.get("picture").toString());
        } else {
            googleUserDTO.setImageUrl("https://d1qaf0hhk6y1ff.cloudfront.net/uploads/default.jpg");
        }

        return googleUserDTO;
    }
}
