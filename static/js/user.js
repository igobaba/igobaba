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
            console.log(response['result'])

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