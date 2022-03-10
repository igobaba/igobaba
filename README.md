# 프로젝트 소개

## 이고바바

여러분들이 즐겨보는 영상을 공유해주세요!

http://igobaba.shop/

##  1.제작 기간 & 팀원 소개

2022.03.07 ~ 2022.03.10
- 권영민
- 조영민
- 김동보

## 2. 시연 연상 

[![이고바바](https://i9.ytimg.com/vi_webp/qowYcOL0tDw/mqdefault.webp?v=62298a87&sqp=CNiZppEG&rs=AOn4CLCaVDIKnaZBY8wyNlGGEYTvTZpufQ)](https://www.youtube.com/watch?v=qowYcOL0tDw)

## 3. 초안

![](https://blog.kakaocdn.net/dn/biwOAr/btrvnWsVHYw/sfExjk7bwwzFlMCPlbZfz0/img.png)

## 4. 사용 기술

* Server: AWS EC2 (Ubuntu 20.04 LTS)
* Framework: Flask (Python)
* Database: MongoDB
* front-end : HTML5, CSS, Javascript, jquery

## 5. 핵심 기능

* 로그인/회원가입
  - 아이디 중복확인 기능 및 입력 요소 유효성 검사
  
* 메인페이지
   * 게시물 검색
     <br>키워드 검색을 통한 게시물 검색
     
   * 게시물 등록
     <br>영상 링크를 포함한 게시물 등록
     <br>크롤링을 통한 영상 썸네일 자동 등록
     
   * 댓글 등록
     <br>선택한 게시물에 댓글 등록
     
   * 페이지 이동
     <br>썸네일 클릭 시, 해당 영상주소로 이동
  

## 6. trouble shooting

<details>
    <summary>
        jinja2 템플릿을 이용해 첫 렌더링을 진행하다보니 javascript datetime 형식으로 저장된 게시물의 날짜와 python datetime 형식이 달라 이를 원하는 요소로 변환하기에 어려움이 있었다.
    </summary>
    <br>
    <div markcown="1">
        python에서의 여러 datetime 형식을 바꿔보며 해결 시도를 하였지만, 시간 부족으로 인해 아직 해결하지 못했다. 첫 렌더링 시가 아닌, ajax통신으로 게시물들을 받아오는 경우에는 javascript형식으로만 진행되어 문제가 발생하지 않았다.
      (2022-03-10:16:44 문제 해결) javascript에서 시간을 저장할 때 new Date().toISOString()을 사용했다. ISO8601은 국제 표준 시간인 UTC를 기준으로 시간을 지정했습니다. 하지만 python datetime에서 제공하는 datetime.now()는 로컬 컴퓨터의 시간을 기준으로 하기 때문에, UTC기준 시간과 다른 대한민국 시간을 주고 있었습니다. 그래서 datetime.utcnow()를 사용해 데이터베이스에 저장되어있는 UTC시간 기준으로 다시 계산을 했습니다. 강의에서 배운 time2str을 참고하여 python에서도 이와 비슷하게 함수를 만들어 사용해 문제를 해결했습니다.
    </div>
</details>

<details>
    <summary>
        게시물 좋아요 데이터가 게시물의 데이터 안에 존재해야하는지, 별도의 데이터로 관리되어야 하는지에 대한 고민이 있었다.
    </summary>
    <br>
    <div markcown="1">
        멘토님께 이를 문의하여 고민을 덜 수 있었다. 해당 문제 같은 경우에는, 좋아요의 기능이 어떻게 사용되냐에 따라, 데이터베이스의 구조가 달라진다고 하였다. 이 프로젝트에서는 좋아요의 기능으로 별도의 추가 기능이 없기 때문에, 별도의 데이터로 관리하기 보다는, 게시물의 데이터안에 삽입하는 것으로 진행했다.
    </div>
</details>
