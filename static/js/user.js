//회원가입
function sign_up() {
    let userId = $('#userId').val();
    let userPw = $('#userPw').val();
    let checkPw = $('#checkPw').val();
    let userBirth = $('#userBirth').val();
    let userNickname = $('#userNickName').val();

    if ($("#help-id").hasClass("is-danger")) {
        alert("아이디를 다시 확인해주세요.")
        return;
    } else if (!$("#help-id").hasClass("is-safe")) {
        alert("아이디 중복확인을 해주세요.")
        return;
    }

    if (userPw === "") {
        $("#help-pw").text("비밀번호를 입력해주세요.").removeClass("is-safe").addClass("is-danger")
        $("#userPw").focus()
        return
    } else if (!is_pw(userPw)) {
        $("#help-pw").text("8-20자 내외 영문과 숫자 필수 포함, 특수문자(!@#$%^&*) 사용가능").removeClass("is-safe").addClass("is-danger")
        $("#userPw").focus()
        return
    } else {
        $("#help-pw").text("사용할 수 있는 비밀번호입니다.").removeClass("is-danger").addClass("is-safe")
    }
    if (checkPw === "") {
        $("#help-checkPw").text("비밀번호를 입력해주세요.").removeClass("is-safe").addClass("is-danger")
        $("#checkPw").focus()
        return
    } else if (checkPw !== userPw) {
        $("#help-checkPw").text("비밀번호가 일치하지 않습니다.").removeClass("is-safe").addClass("is-danger")
        $("#checkPw").focus()
        return
    } else {
        $("#help-checkPw").text("비밀번호가 일치합니다.").removeClass("is-danger").addClass("is-safe")
    }

    if (userBirth === "") {
        $('#help-checkBirth').text('생년월일을 입력해주세요.').removeClass("is-safe").addClass("is-danger")
        $("#userBirth").focus()
        return
    } else {
        $('#help-checkBirth').text('입력완료').removeClass("is-danger").addClass("is-safe")
    }

    if (userNickname === "") {
        $('#help-checkNickname').text('닉네임을 입력해주세요.').removeClass("is-safe").addClass("is-danger")
        $('#userNickName').focus()
        return
    } else {
        $('#help-checkNickname').text('입력완료').removeClass("is-danger").addClass("is-safe")
    }

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

// 정규 표현식
function is_id(id) {
    let idpattern = /^[A-za-z0-9]{4,12}$/;
    return idpattern.test(id);
}

function is_pw(pw) {
    let pwpattern = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{8,20}$/;
    return pwpattern.test(pw);
}

// 아이디 중복 확인
function checkId() {
    let userId = $('#userId').val()
    if (userId === "") {
        $('#help-id').text('아이디를 입력해주세요.').removeClass("is-safe").addClass("is-danger")
        $("#userId").focus()
        return
    } else if (!is_id(userId)) {
        $('#help-id').text('4-12자 이내 대문자, 소문자 영어와 숫자만 가능').removeClass("is-safe").addClass("is-danger")
        $("#userId").focus()
        return
    }

    $.ajax({
        type: "POST",
        url: "/sign_up/check_dup",
        data: {
            userId_give: userId
        },
        success: function (response) {

            if (response["exists"]) {
                $("#help-id").text("이미 존재하는 아이디입니다.").removeClass("is-safe").addClass("is-danger")
                $("#userId").focus()
            } else {
                $("#help-id").text("사용할 수 있는 아이디입니다.").removeClass("is-danger").addClass("is-safe")
            }
            $("#help-id").removeClass("is-loading")

        }
    });
}

//로그인
function user_login() {
    let userId = $('#userId').val();
    let userPw = $('#userPw').val();
    // 추후 유효성 검사 추가해야 함

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