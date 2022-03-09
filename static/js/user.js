let css_color = getComputedStyle(document.documentElement).getPropertyValue("--color");
let css_warning = getComputedStyle(document.documentElement).getPropertyValue("--warning");
let valid_error = 0;

//회원가입
function user_register() {
    let userId = $('#userId').val();
    let userPw = $('#userPw').val();
    let userBirth = $('#userBirth').val();
    let userNickname = $('#userNickName').val();

    if(checkId() === "false"){
        console.log(checkId())
        return
    }

    if ($('#help-id').css('color') === css_warning ||
        $('#help-pw').css('color') === css_warning ||
        $('#help-checkBirth').css('color') === css_warning ||
        $('#help-checkNickname').css('color') === css_warning) {
        return;
    }

    if (userId === "" || userPw === "" || userBirth === "" || userNickname === ""){
        return
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
            $('.wrap').css('transform', 'rotateY(0deg)');
            alert(response['msg'])
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
        $('#help-id').text('아이디를 입력해주세요').css('color', css_warning)
        return "false";
    } else if (!is_id(userId)) {
        $('#help-id').text('4-12자 이내 대문자, 소문자 영어와 숫자만 가능').css('color', css_warning)
        return "false";
    }

    $.ajax({
        type: "POST",
        url: "/sign_up/check_dup",
        data: {
            userId_give: userId
        },
        success: function (response) {
            if (response["exists"]) {
                $("#help-id").text("이미 존재하는 아이디입니다.").css('color', css_warning)
                return "false";
            } else {
                $("#help-id").text("사용할 수 있는 아이디입니다.").css('color', css_color)
                return "true";
            }
        }
    });
}

// 비밀번호 정규표현식
function checkPw() {
    let userPw = $('#userPw').val();
    if (userPw === "") {
        $("#help-pw").text("비밀번호를 입력해주세요").css('color', css_warning)
    } else if (!is_pw(userPw)) {
        $("#help-pw").text("8-20자 내외 영문과 숫자 필수 포함, 특수문자(!@#$%^&*) 사용가능").css('color', css_warning)
    } else {
        $("#help-pw").text("사용할 수 있는 비밀번호입니다.").css('color', css_color)
    }
}

// 비밀번호 일치확인
function checkPwC() {
    let userPw = $('#userPw').val();
    let checkPw = $('#userPwC').val();
    if (checkPw === "") {
        $("#help-pw").text("비밀번호를 입력해주세요.").css('color', css_warning)
        $('#register_btn').attr('disabled', true)
    } else if (checkPw !== userPw) {
        $("#help-pw").text("비밀번호가 일치하지 않습니다.").css('color', css_warning)
        $('#register_btn').attr('disabled', true)
    } else {
        $("#help-pw").text("비밀번호가 일치합니다.").css('color', css_color)
        $('#register_btn').attr('disabled', false)
    }
}

// 생일 확인
function checkBirth() {
    let userBirth = $('#userBirth').val();
    if (userBirth === "") {
        $('#help-checkBirth').text('생년월일을 입력해주세요.').css('color', css_warning)
        $('#register_btn').attr('disabled', true)
    }else {
        $('#help-checkBirth').text('').css('color', css_color)
    }
}

// 닉네임 확인
function checkNickName() {
    let userNickname = $('#userNickName').val();
    if (userNickname === "") {
        $('#help-checkNickname').text('닉네임을 입력해주세요.').css('color', css_warning)
        $('#register_btn').attr('disabled', true)
    }else {
        $('#help-checkNickname').text('').css('color', css_color)
    }
}

//로그인
function user_login() {
    let userId = $('#login_userId').val();
    let userPw = $('#login_userPw').val();

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
function user_post() {
    let url = $('#post_url').val()
    let title = $('#post_title').val()
    let tag = $('#post_tag').val()
    let today = new Date().toISOString()
    $.ajax({
        type: "POST",
        url: "/user/post",
        data: {
            url_give: url,
            title_give: title,
            tag_give: tag,
            date_give: today
        },
        success: function (response) {
            alert(response['msg'])
            window.location.reload()
        }
    })
}

// 코멘트 등록
function user_comment(post_id) {
    let comment_id = post_id + 'comment'
    let comment = $('#'+comment_id).val()
    let today = new Date().toISOString()
    $.ajax({
        type: "POST",
        url: "/user/comment",
        data: {
            id_give: post_id,
            comment_give: comment,
            date_give: today
        },
        success: function (response) {
            alert(response['msg'])
            window.location.reload()
        }
    })
}

// 게시물 좋아요
function user_post_like(post_id) {
    let container_id = post_id + 'good';
    let container = $('#' + container_id)
    $.ajax({
        type: "POST",
        url: "/user/post/like",
        data: {
            id_give: post_id
        },
        success: function (response) {
            // 좋아요가 실행될 경우, 취소될 경우에 따라 이미지를 변경하고, 그에 따른 좋아요 수도 업데이트합니다.
            container.children('img').attr('src', response['bool'] ? '/static/img/heart_pink.png' : '/static/img/heart_white.png')
            container.children('span').text(response['post_len'])
        }
    })
}

// 검색한 게시물 가져오기
function get_post() {
    let keyword = $('#search').val();
    $.ajax({
        type: "POST",
        url: "/get_posts",
        data: {
            key_give: keyword
        },
        success: function (response) {
            $('.main-container').empty();

            let posts = response['result'];
            for (let post of posts) {
                console.log(post)
                let temp_html = `
                <div class="post-container flex-column-start">
                    <div class="flex-row-start" onclick="$('#${post._id}').toggle()">
                        <img alt="썸네일" style="width: 170px;"
                             src="${post.image}">
                        <div class="post-container-div flex-column-start">
                            <div>${post.title}</div>
                            <div class="flex-row-start">
                                <div>${post.writer}</div>
                                <div style="margin-left: 50px;">${post.date}</div>
                            </div>
                            <a href="${post.url}" onclick="event.stopPropagation()">${post.url}</a>
                        </div>
                        <div id="${post._id}good" class="flex-column-center" style="margin-right: 20px">
                            <img alt="좋아요"
                                 src=${post.likeMe ? "/static/img/heart_pink.png" : "/static/img/heart_white.png"}
                                 class="heart-btn"
                                 onclick="user_post_like('${post._id}');event.stopPropagation();">
                            <span class="heart-cnt">${post.like.length}</span>
                        </div>

                    </div>

                    <div id="${post._id}" class="comment-container flex-column-start">
                        <div class="scroll-container">`
                for (let comment of post['comments']) {
                    temp_html += `
                            <div class="comment">
                                <span>${comment.writer}</span>
                                <span>${comment.comment}</span>
                                <span>${comment.date}</span>
                            </div>
                    `
                }
                temp_html += `
                        </div>
                        <div style="bottom: 0; position: absolute">
                            <label for="${post._id}comment"></label>
                            <input id="${post._id}comment" type="text" placeholder="댓글을 입력해주세요" onclick="event.stopPropagation()"
                                   onblur="user_comment('${post._id}');">
                        </div>
                    </div>
                </div>
                `

                $('.main-container').append(temp_html)
            }
        }
    })
}