//회원가입
function user_register() {
    let userId = $('#userId').val();
    let userPw = $('#userPw').val();
    let userBirth = $('#userBirth').val();
    let userNickname = $('#userNickName').val();

    // 추후 유효성 검사 추가해야함

    $.ajax({
        type: "POST",
        url: "/api/register",
        data: {
            id_give: userId,
            pw_give: userPw,
            birth_give: userBirth,
            nickname_give: userNickname
        },
        success: function (response) {
            alert(response['msg'])
            window.location.href = '/login'
        }
    })
}

//로그인
function user_login() {
    let userId = $('#userId').val();
    let userPw = $('#userPw').val();
    // 추후 유효성 검사 추가해야함

    if (username == "") {
        $("#help-id-login").text("아이디를 입력해주세요.")
        $("#input-username").focus()
        return;
    } else {
        $("#help-id-login").text("해당되는 아이디가 없습니다.")
    }

    if (password == "") {
        $("#help-password-login").text("비밀번호를 입력해주세요.")
        $("#input-password").focus()
        return;
    } else {
        $("#help-password-login").text("비밀번호가 일치하지 않습니다.")
    }
    $.ajax({
        type: "POST",
        url: "/api/login",
        data: {
            id_give: userId,
            pw_give: userPw
        },
        success: function (response) {
            if (response['result'] === 'success') {
                // 로그인이 정상적으로 되면, 토큰을 받아옵니다.
                // 이 토큰을 mytoken이라는 키 값으로 쿠키에 저장합니다.
                $.cookie('mytoken', response['token']);

                alert('로그인 완료!')
                window.location.href = '/'
            } else {
                // 로그인이 안되면 에러메시지를 띄웁니다.
                alert(response['msg'])
            }
        }
    })
}

// 게시물 등록
function posting() {
    let url = $('#post_url').val()
    let title = $('#post_title').val()
    let tag = $('#post_tag').val()
    let today = new Date().toISOString()
    $.ajax({
        type: "POST",
        url: "/posting",
        data: {
            url_give: url,
            title_give: title,
            tag_give: tag,
            date_give: today
        },
        success: function (response) {
            alert(response)
            window.location.reload()
        }
    })
}