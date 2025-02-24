DROP DATABASE IF EXISTS king;
CREATE DATABASE king;

USE king;

CREATE TABLE chat_history (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          user_id BIGINT NOT NULL,
                          role VARCHAR(255) NOT NULL,
                          content TEXT NOT NULL,
                          type VARCHAR(255),
                          created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          created DATETIME DEFAULT NOW(),
                          content VARCHAR(255) NOT NULL
);
-- 1. user 테이블
CREATE TABLE `user` (
                        `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `email` VARCHAR(255) NOT NULL,
                        `nickname` VARCHAR(255) UNIQUE,
                        `image_url` VARCHAR(500) NOT NULL,
                        `google_id` VARCHAR(255),
                        `line_id` VARCHAR(255),
                        `created_at` DATETIME DEFAULT NOW(),
                        `description` TEXT NULL,
                        `content_alarm_on` BOOLEAN NULL,
                        `language` VARCHAR(10) NULL, -- en, ja, zh, ko 등
                        `status` VARCHAR(50) NOT NULL, -- ROLE_PENDING, ROLE_REGISTERED, ROLE_DELETED
                        CHECK (`google_id` IS NOT NULL OR `line_id` IS NOT NULL),
                        CHECK (`status` = 'ROLE_PENDING' OR `nickname` IS NOT NULL)
);

-- 2. place 테이블
CREATE TABLE `place` (
                         `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                         `name` VARCHAR(255) NOT NULL,
                         `type` VARCHAR(50) NOT NULL, -- cafe, playground, restaurant, shop, station, stay, store
                         `description` VARCHAR(255) NOT NULL,
                         `open_hour` VARCHAR(255),
                         `break_time` VARCHAR(255),
                         `closed_day` VARCHAR(255),
                         `address` VARCHAR(50),
                         `lat` FLOAT NOT NULL,
                         `lng` FLOAT NOT NULL,
                         `phone` VARCHAR(50),
                         `image_url` VARCHAR(500),
                         `created_at` DATETIME DEFAULT NOW(),
                         `view` INT UNSIGNED NOT NULL
);

-- 3. content 테이블
CREATE TABLE `content` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `type` VARCHAR(50) NOT NULL, -- drama, movie, show
                           `broadcast` VARCHAR(255),
                           `created_at` DATETIME DEFAULT NOW(),
                           `image_url` VARCHAR(500),
                           `tmdb_id` INT UNSIGNED NOT NULL
);

-- 4. content 번역 테이블
CREATE TABLE `content_ko` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `title` VARCHAR(255) NOT NULL,
                              `description` TEXT,
                              `content_id` INT UNSIGNED NOT NULL,
                              FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5.
CREATE TABLE `content_en` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `title` VARCHAR(255) NOT NULL,
                              `description` TEXT,
                              `content_id` INT UNSIGNED NOT NULL,
                              FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6.
CREATE TABLE `content_ja` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `title` VARCHAR(255) NOT NULL,
                              `description` TEXT,
                              `content_id` INT UNSIGNED NOT NULL,
                              FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7.
CREATE TABLE `content_zh` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `title` VARCHAR(255) NOT NULL,
                              `description` TEXT,
                              `content_id` INT UNSIGNED NOT NULL,
                              FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. cast 테이블
CREATE TABLE `cast` (
                        `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `image_url` VARCHAR(500),
                        `birth_date` VARCHAR(100),
                        `participating_work` INT UNSIGNED,
                        `created_at` DATETIME DEFAULT NOW(),
                        `tmdb_id` INT UNSIGNED NOT NULL
);

-- 9.
CREATE TABLE `cast_ko` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `birth_place` VARCHAR(200),
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 10.
CREATE TABLE `cast_en` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `birth_place` VARCHAR(200),
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 11.
CREATE TABLE `cast_ja` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `birth_place` VARCHAR(200),
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 12.
CREATE TABLE `cast_zh` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `birth_place` VARCHAR(200),
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 13. place_content (장소_콘텐츠 연결)
CREATE TABLE `place_content` (
                                 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                 `place_id` INT UNSIGNED NOT NULL,
                                 `content_id` INT UNSIGNED NOT NULL,
                                 `description` TEXT NOT NULL, -- 장소와 컨텐츠 관련 설며
                                 FOREIGN KEY (`place_id`) REFERENCES `place`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                 FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 14. content_cast (콘텐츠_연예인 연결)
CREATE TABLE `content_cast` (
                                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                `content_id` INT UNSIGNED NOT NULL,
                                `cast_id` INT UNSIGNED NOT NULL,
                                FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 15. place_cast (장소_연예인 연결)
CREATE TABLE `place_cast` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `place_id` INT UNSIGNED NOT NULL,
                              `cast_id` INT UNSIGNED NOT NULL,
                              `description` TEXT NULL, -- 장소와 연예인 관계 설명
                              FOREIGN KEY (`place_id`) REFERENCES `place`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                              FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 16. post 테이블
CREATE TABLE `post` (
                        `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `content` TEXT,
                        `created_at` DATETIME DEFAULT NOW(),
                        `updated_at` DATETIME DEFAULT NOW(),
                        `user_id` INT UNSIGNED NOT NULL,
                        `place_id` INT UNSIGNED NOT NULL,
                        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                        FOREIGN KEY (`place_id`) REFERENCES `place`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE -- no action
);

-- 17. post_image 테이블
CREATE TABLE `post_image` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `image_url` VARCHAR(500) NOT NULL,
                              `post_id` INT UNSIGNED NOT NULL,
                              FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 18. comment 테이블
CREATE TABLE `comment` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `content` TEXT NOT NULL,
                           `created_at` DATETIME DEFAULT NOW(),
                           `post_id` INT UNSIGNED NOT NULL,
                           `user_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                           FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 19. like 테이블
CREATE TABLE `like` (
                        `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `post_id` INT UNSIGNED NOT NULL,
                        `user_id` INT UNSIGNED NOT NULL,
                        `created_at` DATETIME DEFAULT NOW(),
                        FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 20. curation_list 테이블
CREATE TABLE `curation_list` (
                                 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                 `user_id` INT UNSIGNED NOT NULL,
                                 `title` VARCHAR(255) NOT NULL,
                                 `is_public` BOOLEAN NOT NULL,
                                 `created_at` DATETIME DEFAULT NOW(),
                                 `updated_at` DATETIME DEFAULT NOW(),
                                 `description` TEXT,
                                 `image_url` VARCHAR(500) NOT NULL,
                                 FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 21. curation_list_item (큐레이션 리스트_장소 연결)
CREATE TABLE `curation_list_item` (
                                      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                      `curation_list_id` INT UNSIGNED NOT NULL,
                                      `place_id` INT UNSIGNED NOT NULL,
                                      FOREIGN KEY (`curation_list_id`) REFERENCES `curation_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                      FOREIGN KEY (`place_id`) REFERENCES `place`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 22. curation_list_bookmark 테이블
CREATE TABLE `curation_list_bookmark` (
                                          `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                          `user_id` INT UNSIGNED NOT NULL,
                                          `curation_list_id` INT UNSIGNED NOT NULL,
                                          `created_at` DATETIME DEFAULT NOW(),
                                          FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                          FOREIGN KEY (`curation_list_id`) REFERENCES `curation_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 23. content_favorite 테이블 (콘텐츠 즐겨찾기)
CREATE TABLE `content_favorite` (
                                    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                    `user_id` INT UNSIGNED NOT NULL,
                                    `content_id` INT UNSIGNED NOT NULL,
                                    `created_at` DATETIME DEFAULT NOW(),
                                    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 24. cast_favorite 테이블 (연예인 즐겨찾기)
CREATE TABLE `cast_favorite` (
                                 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                 `user_id` INT UNSIGNED NOT NULL,
                                 `cast_id` INT UNSIGNED NOT NULL,
                                 `created_at` DATETIME DEFAULT NOW(),
                                 FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 25. notification 테이블
CREATE TABLE `notification` (
                                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                `user_id` INT UNSIGNED NOT NULL,
                                `type` VARCHAR(50) NOT NULL,
                                `message` VARCHAR(500) NOT NULL,
                                `is_read` BOOLEAN NOT NULL,
                                `created_at` DATETIME DEFAULT NOW(),
                                `target_type` VARCHAR(50) NOT NULL,
                                `target_id` INT UNSIGNED NOT NULL,
                                FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 26. search_ranking 테이블
CREATE TABLE `search_ranking` (
                                  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                  `keyword` VARCHAR(255) NOT NULL,
                                  `period` VARCHAR(50) NOT NULL,
                                  `rank` INT NOT NULL,
                                  `search_count` INT UNSIGNED NOT NULL,
                                  `date` DATETIME DEFAULT NOW()
);


-- 더미데이터
-- 1. user 테이블
INSERT INTO `user` (`email`, `nickname`, `image_url`, `google_id`, `line_id`, `created_at`, `description`, `content_alarm_on`, `language`, `status`)
VALUES
    ('user1@example.com', 'user1', 'http://example.com/user1.jpg', 'google1', NULL, NOW(), 'Travel enthusiast.', TRUE, 'en', 'ROLE_REGISTERED'),
    ('user2@example.com', 'user2', 'http://example.com/user2.jpg', 'google2', 'line1', NOW(), 'Loves movies and coffee.', FALSE, 'ko', 'ROLE_REGISTERED'),
    ('user3@example.com', 'user3', 'http://example.com/user3.jpg', 'google3', NULL, NOW(), 'Passionate about art.', TRUE, 'zh', 'ROLE_REGISTERED'),
    ('user4@example.com', 'user4', 'http://example.com/user4.jpg', 'google4', 'line2', NOW(), 'Tech geek and foodie.', FALSE, 'ja', 'ROLE_REGISTERED'),
    ('user5@example.com', 'user5', 'http://example.com/user5.jpg', 'google5', NULL, NOW(), 'History buff.', TRUE, 'en', 'ROLE_REGISTERED');

-- 2. place 테이블
INSERT INTO `place` (`name`, `type`, `description`, `open_hour`, `break_time`, `closed_day`, `address`, `lat`, `lng`, `phone`, `image_url`, `view`)
VALUES
    ('커피파머', 'cafe', '커피파머입니다.', '09:00 - 21:00', '정보없음', '연중무휴', '경기도 고양시 일산서구 대화로 61', 37.667523, 126.72817, '031-1899-8903', 'https://lh5.googleusercontent.com/p/AF1QipMsttnqldtIWuj3qUMHWGqa8Xk0GCBiep7cqFgr=w408-h544-k-no', 450),
    ('셀렉토커피 남양주호평점', 'cafe', '셀렉토커피 남양주호평점입니다.', '08:00 - 22:00', '정보없음', '연중무휴', '경기도 남양주시 천마산로 21', 37.663558, 127.24748, '031-511-6362', 'https://lh5.googleusercontent.com/p/AF1QipMsttnqldtIWuj3qUMHWGqa8Xk0GCBiep7cqFgr=w408-h544-k-no', 300),
    ('연희네 슈퍼', 'playground', '연희네 슈퍼입니다.', '00:00 - 24:00', '정보없음', '연중무휴', '전라남도 목포시 해안로127번길 14-2', 34.78168, 126.377325, '061-270-8432', 'https://lh5.googleusercontent.com/p/AF1QipMsttnqldtIWuj3qUMHWGqa8Xk0GCBiep7cqFgr=w408-h544-k-no', 200),
    ('청남대', 'playground', '청남대입니다.', '09:00 - 18:00', '정보없음', '월요일', '충청북도 청주시 상당구 문의면 청남대길 646', 36.46255, 127.4906, '043-257-5080', 'https://lh5.googleusercontent.com/p/AF1QipMsttnqldtIWuj3qUMHWGqa8Xk0GCBiep7cqFgr=w408-h544-k-no', 500);

-- 3. content 테이블
INSERT INTO `content` (`type`, `broadcast`, `created_at`, `image_url`, `tmdb_id`)
VALUES
    ('DRAMA', 'KBS', NOW(), null, 101),
    ('MOVIE', 'CJ Entertainment', NOW(), 'https://image.tmdb.org/t/p/w500/mO55nkEFrI2EVdjxx0asaOGtHfa.jpg', 102),
    ('SHOW', 'SBS', NOW(), 'https://image.tmdb.org/t/p/w500/aTixMf5OaKA50QNvcKv18X9SLjX.jpg', 103),
    ('DRAMA', 'JTBC', NOW(), 'https://image.tmdb.org/t/p/w500/5dZijYdQMyaV22CZn9IVmdxdTBs.jpg', 67014),
    ('DRAMA', 'MBC', NOW(), 'https://image.tmdb.org/t/p/w500/lX5Gn41rG3lcGAQHPJqLOK1fwwP.jpg', 66330),
    ('SHOW', 'tvN', NOW(), 'https://image.tmdb.org/t/p/w500/9C6MhvOK87gUFchadlau1ypUuiG.jpg', 75750),
    ('SHOW', 'tvN', NOW(), 'https://image.tmdb.org/t/p/w500/pnibkuL74C33GoKLTXAmF4nl3a6.jpg', 78648),
    ('SHOW', 'tvN', NOW(), 'https://image.tmdb.org/t/p/w500/2I5lAbIFUluXJH6cgnfy08zYJW4.jpg', 78477);

-- 4. content_ko 테이블
INSERT INTO `content_ko` (`title`, `description`, `content_id`)
VALUES
    ('(아는 건 별로 없지만) 가족입니다', '가족의 관계를 다시 조명하는 감동적인 드라마.', 1),
    ('1987', '역사적 사건을 바탕으로 한 강렬한 영화.', 2),
    ('1박2일', '한국의 아름다움을 보여주는 예능 프로그램.', 3),
    ('청춘시대', '외모부터 성격, 전공, 남자 취향, 연애스타일까지 모두 다른 5명의 매력적인 여대생이 셰어하우스 벨 에포크에 모여 살며 벌어지는 유쾌하고 발랄한 청춘 드라마.', 4),
    ('W(더블유)', '같은 공간 다른 차원을 교차하는 사건의 중심에 선 냉철한 천재 벤처재벌 강철과 활달하고 정 많은 외과의사 오연주가 펼치는 로맨틱 서스펜스 멜로 드라마.', 5),
    ('신서유기 외전: 강식당', '셰프가 된 요괴들의 리얼 장사 프로젝트! 힘든 하루의 무게만큼 빈 그릇의 기쁨을 배워가는 식구들과 그들을 찾아온 다양한 손님들이 만들어낸 소란한 보통날의 이야기.', 6),
    ('놀라운 토요일', '‘좋아요’ 폭발하는 SNS 핵 공감 핫 플레이스부터 오랜 전통이 살아 숨 쉬는 노포까지! 혀르가즘 자극하는 시장의 먹거리를 얻기 위한 MC군단의 자존심을 건 미션 수행!', 7),
    ('선다방', '‘일반인 맞선 전문 예약제 카페’를 콘셉트로, 스타 카페지기들이 실제 맞선 전문 카페를 운영하며 다양한 삶의 이야기를 나누는 프로그램.', 8);

-- 5. content_en 테이블
INSERT INTO `content_en` (`title`, `description`, `content_id`)
VALUES
    ('(My Unfamiliar Family)', 'A touching drama about family relationships.', 1),
    ('1987', 'A powerful film based on historical events.', 2),
    ('2 Days 1 Night', 'A show highlighting Koreas beauty.', 3),
    ('Age of Youth', 'A story about five young women with different personalities living together in a shared house.', 4),
    ('W: Two Worlds', 'A romantic suspense drama about a genius entrepreneur and a warm-hearted doctor crossing different dimensions.', 5),
    ('Kang’s Kitchen', 'A real-life restaurant project where celebrities take on the challenge of running a restaurant.', 6),
    ('Amazing Saturday', 'A music variety show where the cast competes to guess lyrics and win delicious food.', 7),
    ('The Love Studio', 'A show featuring real-life blind dates, hosted by celebrity café managers.', 8);

-- 8. cast 테이블
INSERT INTO `cast` (`image_url`, `birth_date`, `participating_work`, `created_at`, `tmdb_id`)
VALUES
    (null, '1990-01-01', 5, NOW(), 201),
    (null, '1981-07-28', 10, NOW(), 203),
    ('https://image.tmdb.org/t/p/w500/tceyY4cqTxkiar4jFjPnEaZ6QRZ.jpg', '1970-06-11', 61, NOW(), 1250840),
    ('https://image.tmdb.org/t/p/w500/zwEmEAS7CAuJLwhLhvSB09La1QM.jpg', '1975-02-10', 79, NOW(), 1250841),
    ('https://image.tmdb.org/t/p/w500/9GVVhuZ2e7BTj9WR3WyenVfIDRw.jpg', '1994-06-09', 42, NOW(), 1413827),
    ('https://image.tmdb.org/t/p/w500/67YkqSOk6LSAoM6WzSeXgerM7nD.jpg', '1994-10-10', 35, NOW(), 1014784),
    ('https://image.tmdb.org/t/p/w500/eW73DbmKQrqb6xDC52oMbVehw6G.jpg', '1989-09-14', 34, NOW(), 1095818),
    ('https://image.tmdb.org/t/p/w500/7ZMUHR2q0XTWMxuqijWSVfWQv14.jpg', '1988-04-01', 42, NOW(), 1470763);

-- 9. cast_ko 테이블
INSERT INTO `cast_ko` (`name`, `birth_place`, `cast_id`)
VALUES
    ('한예리', 'Seoul, South Korea', 1),
    ('조인성', 'Seoul, South Korea', 2),
    ('강호동', 'Jinju, South Gyeongsang, South Korea', 3),
    ('이수근', 'Yangpyeong, Gyeonggi, South Korea', 4),
    ('이혜리', 'Gwangju, Gyeonggi, South Korea', 5),
    ('수지', 'Gwangju, South Korea', 6),
    ('이종석', 'Suwon, Gyeonggi, South Korea', 7),
    ('정해인', 'Seoul, South Korea', 8);

-- 10. cast_en 테이블
INSERT INTO `cast_en` (`name`, `birth_place`, `cast_id`)
VALUES
    ('han', 'Seoul, South Korea', 1),
    ('jo', 'Seoul, South Korea', 2),
    ('Kang Ho-dong', 'Jinju, South Gyeongsang, South Korea', 3),
    ('Lee Soo-geun', 'Yangpyeong, Gyeonggi, South Korea', 4),
    ('Lee Hye-ri', 'Gwangju, Gyeonggi, South Korea', 5),
    ('Bae Suzy', 'Gwangju, South Korea', 6),
    ('Lee Jong-suk', 'Suwon, Gyeonggi, South Korea', 7),
    ('Jung Hae-in', 'Seoul, South Korea', 8);

-- 13. place_content 테이블
INSERT INTO `place_content` (`place_id`, `content_id`, `description`)
VALUES
    (1, 1, '6회에서 김은희(한예리)와 안효석(이종원)이 윤태형(김태호)의 은신처에서 서울로 돌아갈 때 이 카페에 들린다.'),
    (2, 1, '10회에서 하라(배윤경)는 은희(한예리)에게 이 커피숍에서 만나자고 메시지를 보낸다. 그녀는 은희에게 곧 미국으로 돌아간다고 알리고 건주(신동욱)에 대한 이야기를 이어간다.'),
    (3, 2, '영화 1987에서 연희네 슈퍼로 나온 가게.'),
    (4, 3, '청남대는 1박2일에서 촬영한 아름다운 장소이다.');

-- 14. content_cast 테이블
INSERT INTO `content_cast` (`content_id`, `cast_id`)
VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (3, 1),
    (3, 3),
    (3, 4),
    (4,5),
    (4,6),
    (5,6),
    (5,7),
    (5,8),
    (6, 3),
    (6, 4);

-- 15. place_cast 테이블
INSERT INTO `place_cast` (`place_id`, `cast_id`, `description`)
VALUES
    (1, 1, '한예리가 이 카페를 촬영 장소로 방문했습니다.'),
    (2, 2, '김태호가 이곳에서 인상적인 장면을 연출했습니다.'),
    (4, 3, '조인성이 청남대의 아름다운 풍경을 즐겼습니다.');

-- 16. post 테이블
INSERT INTO `post` (`content`, `created_at`, `updated_at`, `user_id`, `place_id`)
VALUES
    ('아름다운 분위기와 훌륭한 커피!', NOW(), NOW(), 1, 1),
    ('휴식과 작업하기에 완벽한 장소.', NOW(), NOW(), 2, 2),
    ('추억을 떠올리게 하는 장소.', NOW(), NOW(), 1, 3);

-- 17. post_image 테이블
INSERT INTO `post_image` (`image_url`, `post_id`)
VALUES
    ('http://example.com/post1.jpg', 1),
    ('http://example.com/post2.jpg', 2),
    ('http://example.com/post3.jpg', 3);

-- 18. comment 테이블
INSERT INTO `comment` (`content`, `created_at`, `post_id`, `user_id`)
VALUES
    ('저도 이곳을 방문해보고 싶어요!', NOW(), 1, 2),
    ('정말 멋져 보이네요!', NOW(), 2, 1),
    ('이곳은 많은 추억을 떠올리게 하네요!', NOW(), 3, 1);

-- 19. like 테이블
INSERT INTO `like` (`post_id`, `user_id`, `created_at`)
VALUES
    (1, 2, NOW()),
    (2, 1, NOW()),
    (3, 2, NOW());

-- 20. curation_list 테이블
INSERT INTO `curation_list` (`user_id`, `title`, `is_public`, `created_at`, `updated_at`, `description`, `image_url`)
VALUES
    (1, '좋아하는 카페', TRUE, NOW(), NOW(), '내가 좋아하는 카페 목록입니다.', 'http://example.com/favoritecafes.jpg'),
    (2, '꼭 가봐야 할 장소', TRUE, NOW(), NOW(), '꼭 가봐야 할 장소를 정리한 목록입니다.', 'http://example.com/mustvisit.jpg');

-- 21. curation_list_item 테이블
INSERT INTO `curation_list_item` (`curation_list_id`, `place_id`)
VALUES
    (1, 1),
    (1, 2),
    (2, 3);

-- 22. curation_list_bookmark 테이블
INSERT INTO `curation_list_bookmark` (`user_id`, `curation_list_id`, `created_at`)
VALUES
    (2, 1, NOW()),
    (1, 2, NOW());

-- 23. content_favorite 테이블
INSERT INTO `content_favorite` (`user_id`, `content_id`, `created_at`)
VALUES
    (1, 1, NOW()),
    (2, 2, NOW()),
    (1, 3, NOW());

-- 24. cast_favorite 테이블
INSERT INTO `cast_favorite` (`user_id`, `cast_id`, `created_at`)
VALUES
    (1, 1, NOW()),
    (2, 2, NOW()),
    (1, 3, NOW());

-- 25. notification 테이블
INSERT INTO `notification` (`user_id`, `type`, `message`, `is_read`, `created_at`, `target_type`, `target_id`)
VALUES
    (1, 'INFO', '귀하의 큐레이션 리스트가 업데이트되었습니다.', FALSE, NOW(), 'curation_list', 1),
    (2, 'ALERT', '새로운 장소가 즐겨찾기 리스트에 추가되었습니다.', FALSE, NOW(), 'place', 2);

-- 26. search_ranking 테이블
INSERT INTO `search_ranking` (`keyword`, `period`, `rank`, `search_count`, `date`)
VALUES
    ('서울의 카페', '2025-01', 1, 500, NOW()),
    ('최고의 놀이터', '2025-01', 2, 300, NOW()),
    ('인기 있는 한국 드라마', '2025-01', 3, 250, NOW());
