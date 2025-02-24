# K-ing

## 프로젝트 진행 기간

**2025.01.06 ~ 2025.02.21 (7주)**

## 📌 목차

- [프로젝트 소개](#프로젝트-소개)
- [기능 소개](#기능-소개)
- [기술 스택](#기술-스택)
- [아키텍쳐](#아키텍쳐)
- [팀원](#팀원)

## ✏️프로젝트 소개

안녕하세요. 국내외 K컨텐츠 팬들을 위한 촬영지 탐색 및 큐레이팅 SNS 플랫폼, K-ing입니다.

[2024 해외한류실태조사 결과보고서](https://hallyuresearch.kofice.or.kr/bbs/board.php?bo_table=report&wr_id=55&sca=%ED%95%B4%EC%99%B8%ED%95%9C%EB%A5%98%EC%8B%A4%ED%83%9C%EC%A1%B0%EC%82%AC)에 따르면 외국인이 한국을 떠올렸을 때 연상되는 1순위에 K-Pop, 드라마, 영화, 예능 프로그램이 자리잡고 있습니다. 실제로도 K-컨텐츠에 대한 관심이 높고, 실제로 한국 제품의 구매, 관광 등으로 이어지고 있다고 합니다.

하지만 한국 여행을 시도할 때 외국인이 가장 큰 문제점으로 꼽는 건 길찾기 앱입니다. 방한 외국인 관광객 대상 설문에 따르면 지도앱이 한국 여행 관련 가장 불만족한 앱 상위권을 차지했습니다. [출처](https://www.hankyung.com/article/202408093547g)

저희 팀은 K-컨텐츠에 대한 관심이 높은 국내외 여행객들을 위한 촬영지 장소를 큐레이팅 하는 sns 서비스를 제공하여 이러한 문제점을 해결하고, 더 나아가 글로벌 한류팬의 한국 여행을 장려하여 관광 산업의 성장 및 지역 발전까지 도모하는 것을 목표로 하고 있습니다!

## 🚀기능 소개

<p align="center">
  <img src="/readme/desc.png" width="90%"/>
</p>

### 로그인

구글 로그인과 라인 로그인을 구현했습니다.
사용할 닉네임과 언어를 설정한 후 **회원가입**을 진행합니다. 중복된 닉네임은 사용 불가합니다.
회원가입 완료 후 **홈 화면**으로 진입합니다.

<p align="center">
  <img src="/readme/login1.png" width="30%"/>
  <img src="/readme/login2.png" width="30%"/>
  <img src="/readme/login3.png" width="30%"/>
</p>

### 검색 / 랭킹

① **홈 화면** 검색창에서 찾고자 하는 **컨텐츠/연예인/촬영지**를 검색하거나
② **트렌딩 검색어 TOP 8**의 실시간 인기 검색어를 통해 원하는 정보를 조회할 수 있습니다.
③ **지도 버튼**을 통해 지도 맵 화면으로 이동하여 장소 목록을 확인할 수 있습니다.

검색창을 사용할 때는 자동완성을 통해 간편하게 정보를 검색하여 해당 정보의 상세 페이지로 이동합니다.
**촬영지 알아보기**를 클릭하여 해당 컨텐츠가 촬영된 장소를 확인할 수 있습니다.

<p align="center">
  <img src="/readme/autocomplete.gif" width="30%"/>
  <img src="/readme/map.gif" width="30%"/>
  <img src="/readme/content.gif" width="30%"/>
</p>

### 정렬 / 필터링

① 조회한 장소들을 최신순, 인기순, 가나다순으로 확인할 수 있습니다.
② **필터 버튼**을 통해 필터 화면으로 이동하여 장소 유형별, 지역별로 장소를 필터링할 수 있습니다.

<p align="center">
  <img src="/readme/sorting.gif" width="40%"/>
  <img src="/readme/filter.gif" width="40%"/>
</p>

### DeepLink 길찾기

네이버 지도와 구글 지도로 장소를 길찾기할 수 있습니다.

<p align="center">
  <img src="/readme/deeplink.gif" width="40%"/>
</p>

### SNS 기능

하단 바의 **upload 탭**을 눌러 **인증샷 업로드**에 들어가면 게시글을 업로드 할 수 있습니다.
임시저장 해두었던 글이 있다면 이어서 작성 가능합니다.
게시글 업로드 시 사진 첨부, 내용 입력, 게시글 공개/비공개 설정, 장소 태깅이 가능합니다. 자동완성 장소 검색 기능을 통해 간편하게 장소 태깅 가능합니다.

<p align="center">
  <img src="/readme/post.gif" width="40%"/>
  <img src="/readme/home.gif" width="40%"/>
</p>

### 큐레이션

하단바의 **Upload탭**을 누르고 **큐레이션 발행**으로 이동하면 큐레이션을 생성할 수 있습니다.
사진 첨부, 내용 입력하고 큐레이션에서 모아보고 싶은 장소들을 추가하여 업로드 합니다.
큐레이션 작성자라면 **수정 및 삭제**할 수 있습니다.

<p align="center">
  <img src="/readme/curation1.gif" width="30%"/>
  <img src="/readme/curation2.gif" width="30%"/>
  <img src="/readme/curation_map.gif" width="30%"/>
</p>

### 번역

외국인 타겟 서비스인 만큼 영어, 중국어, 일본어를 제공합니다.
챗봇도 사용자 언어별 채팅을 제공합니다.

<p align="center">
  <img src="/readme/language.gif" width="40%"/>
  <br>
  <img src="/readme/chat_ja_T.gif" width="30%"/>
  <img src="/readme/chat_en_F.gif" width="30%"/>
  <img src="/readme/chat_zh_F.gif" width="30%"/>
</p>

### T/F 챗봇

AI와 채팅을 통해 두 가지 정보를 얻을 수 있습니다.

① **데이터 기반 장소 검색 T봇** : 드라마, 예능 등을 촬영한 장소, 연예인이 방문한 장소를 찾아줍니다.
② **맞춤 큐레이션 추천 F봇** : 사용자와 대화를 통해 가장 적합한 큐레이션을 추천합니다.

장소 또는 큐레이션를 추천할 경우, 버튼을 통해 상세 페이지로 이동할 수 있습니다.

<p align="center">
  <img src="/readme/chat_ko_T.gif" width="45%"/>
  <img src="/readme/chat_ko_F.gif" width="45%"/>
</p>

### 아카이브

북마크한 큐레이션과 즐겨찾기를 표시한 작품과 연예인을 확인할 수 있습니다.

<p align="center">
  <img src="/readme/archive.gif" width="40%"/>
</p>

### 마이페이지 / 설정

**‘Posts’**와 **‘Curations’** 탭에서 내가 업로드한 게시글과 큐레이션을 확인할 수 있습니다.
클릭 시 상세 페이지로 이동하며, 썸네일에서 비공개 컨텐츠는 자물쇠가 표시됩니다.
톱니바퀴 아이콘을 통해 설정 페이지로 이동할 수 있습니다.

<p align="center">
  <img src="/readme/language.gif" width="40%"/>
</p>

## ⚙️기술 스택

<table>
    <tr>
        <td><b>Back-end</b></td>
        <td><img src="https://img.shields.io/badge/Java-007396?style=flat-square&logo=Java&logoColor=white"/>
<img src="https://img.shields.io/badge/Spring Boot-6DB33F?style=flat-square&logo=Spring Boot&logoColor=white"/>
<img src="https://img.shields.io/badge/Spring Security-6DB33F?style=flat-square&logo=Spring Security&logoColor=white"/>
<img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=JSON Web Tokens&logoColor=white"/>
<img src="https://img.shields.io/badge/Gradle-C71A36?style=flat-square&logo=Gradle&logoColor=white"/>
<br>
<img src="https://img.shields.io/badge/MySql-4479A1?style=flat-square&logo=mysql&logoColor=white">
<img src="https://img.shields.io/badge/JPA-59666C?style=flat-square&logo=Hibernate&logoColor=white"/>
<img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white"/>
<img src="https://img.shields.io/badge/AWS S3-569A31?style=flat-square&logo=Amazon S3&logoColor=white"/>
<img src="https://img.shields.io/badge/Elasticsearch-005571?style=flat-square&logo=Elasticsearch&logoColor=white"/>
<img src="https://img.shields.io/badge/FCM-FFCA28?style=flat-square&logo=Firebase&logoColor=white"/>
<br>
<img src="https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=OpenAI&logoColor=white"/>
<img src="https://img.shields.io/badge/WebSocket-008CCD?style=flat-square&logo=WebRTC&logoColor=white"/>
<br>

</td>
    </tr>
    <tr>
    <td><b>Front-end</b></td>
    <td>
<img src="https://img.shields.io/badge/Npm-CB3837?style=flat-square&logo=Npm&logoColor=white"/>
<img src="https://img.shields.io/badge/Node-339933?style=flat-square&logo=Node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=white"/>
<img src="https://img.shields.io/badge/Recoil-3578E5?style=flat-square&logo=Recoil&logoColor=white"/>
<br>
<img src="https://img.shields.io/badge/JSON-000000?style=flat-square&logo=json&logoColor=white"/>
<img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white"/>
<img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white"/>
    </td>
    </tr>
    <tr>
    <td><b>Infra</b></td>
    <td>
<img src="https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazon aws&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-4479A1?style=flat-square&logo=Docker&logoColor=white"/>
<img src="https://img.shields.io/badge/NGINX-009639?style=flat-square&logo=NGINX&logoColor=white"/>

</td>
    <tr>
    <td><b>Tools</b></td>
    <td>
    <img src="https://img.shields.io/badge/Notion-333333?style=flat-square&logo=Notion&logoColor=white"/>
    <img src="https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=Figma&logoColor=white"/>
    <img src="https://img.shields.io/badge/GitLab-FCA121?style=flat-square&logo=GitLab&logoColor=white"/>
<img src="https://img.shields.io/badge/JIRA-0052CC?style=flat-square&logo=JIRA Software&logoColor=white"/>
<img src="https://img.shields.io/badge/Mattermost-0058CC?style=flat-square&logo=Mattermost&logoColor=white"/>
    </td>
    </tr>
</table>

## 아키텍쳐

![image](/readme/architecture.png){width=606 height=416}

## 👥팀원

- FE: 이효승, 공예슬, 김민경
- BE: 김상욱, 최은영, 이하경
- Infra: 이하경
- AI: 공예슬
