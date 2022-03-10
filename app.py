from pymongo import MongoClient
from bson.objectid import ObjectId
import jwt
import datetime
import hashlib
import certifi
import requests
from flask import Flask, render_template, jsonify, request, redirect, url_for
from datetime import datetime, timedelta
from ignore import db
from dateutil import parser
from bs4 import BeautifulSoup


app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

SECRET_KEY = 'SPARTA'

ca = certifi.where()
client = MongoClient(db, tlsCAFile=ca)
db = client.dbsparta_1week


@app.route('/')
def home():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"id": payload['id']})
        posts = list(db.posts.find())
        # 최신순으로 보이기 위해 역순 정렬
        sorted_post = sorted(posts, key=lambda x: (x['date']), reverse=True)

        for p in sorted_post:
            # 해당 게시물을 내가 좋아요 했는지
            if payload['_id'] in p['like']:
                p['likeMe'] = True
            else:
                p['likeMe'] = False

            # 게시물과 댓글이 얼마전에 올라왔는지
            p['date'] = time2str(p['date'])
            for c in p['comments']:
                c['date'] = time2str(c['date'])

        return render_template('index.html', user_info=user_info, posts=sorted_post)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


# 날짜 차이를 ~시간, ~일로 계산하는 함수
def time2str(date):
    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    comp1 = parser.parse(now)
    comp2 = parser.parse(date)
    diff = comp1 - comp2
    diff_time = diff.seconds / 3600
    diff_min = diff.seconds / 60
    if diff.days == 0:
        if diff_time < 1:
            print(diff_min)
            result = str(int(diff_min)) + "분 전"
        else:
            result = str(int(diff_time)) + "시간 전"
    else:
        result = str(diff.days) + "일 전"
    return result


@app.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', msg=msg)


@app.route('/register')
def register():
    return render_template('signup.html')


# [로그인 API]
# id, pw를 받아서 맞춰보고, 토큰을 만들어 발급합니다.
@app.route('/api/login', methods=['POST'])
def api_login():
    # ajax통신으로 각각의 값을 불러옵니다.
    id_recv = request.form['id_give']
    pw_recv = request.form['pw_give']

    # 회원가입 때와 같은 방법으로 pw를 암호화합니다.
    pw_hash = hashlib.sha256(pw_recv.encode('utf-8')).hexdigest()

    # db users 테이블로부터 id와 pw가 일치하는 유저의 정보를 불러옵니다.
    result = db.users.find_one({'id': id_recv, 'pw': pw_hash})

    # 유저가 존재하면 JWT 토큰을 만들어 발급합니다.
    if result is not None:
        # JWT 토큰에는, payload와 시크릿키가 필요합니다.
        # 시크릿키가 있어야 토큰을 디코딩(=풀기) 해서 payload 값을 볼 수 있습니다.
        # 아래에선 id와 exp를 담았습니다. 즉, JWT 토큰을 풀면 유저ID 값을 알 수 있습니다.
        # exp에는 만료시간을 넣어줍니다. 만료시간이 지나면, 시크릿키로 토큰을 풀 때 만료되었다고 에러가 납니다.
        payload = {
            '_id': str(result['_id']),
            'id': id_recv,
            'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256').decode('utf-8')

        # token을 줍니다.
        return jsonify({'result': 'success', 'token': token})
    # 유저가 없을 경우
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})


# [회원가입 API]
@app.route('/api/register', methods=['POST'])
def api_register():
    # ajax통신으로부터 각각의 값을 불러옵니다.
    id_recv = request.form['id_give']
    pw_recv = request.form['pw_give']
    birth_recv = request.form['birth_give']
    nickname_recv = request.form['nickname_give']

    # 비밀번호를 해쉬함수로 암호화 시켜줍니다.
    pw_hash = hashlib.sha256(pw_recv.encode('utf-8')).hexdigest()

    # 객체형태로 받아온 정보들을 저장합니다.
    doc = {
        "id": id_recv,
        "pw": pw_hash,
        "birth": birth_recv,
        "nickname": nickname_recv
    }

    # db users 테이블에 정보를 추가합니다.
    db.users.insert_one(doc)
    return jsonify({'msg': 'success'})


# ID 중복확인 #git
@app.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    userid_receive = request.form['userId_give']
    exists = bool(db.users.find_one({"id": userid_receive}))
    return jsonify({'result': 'success', 'exists': exists})


# 게시물 작성
@app.route('/user/post', methods=['POST'])
def user_post():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"id": payload["id"]})

        url_recv = request.form["url_give"]
        title_recv = request.form["title_give"]
        date_recv = request.form["date_give"]
        tag_recv = request.form["tag_give"]

        # 영상 주소 링크로 썸네일 크롤링
        data = requests.get(url_recv)
        soup = BeautifulSoup(data.text, 'html.parser')
        image_recv = soup.select_one('meta[property="og:image"]')['content']

        #태그를 #를 기준으로 분할합니다.
        tags = tag_recv.split('#')
        del tags[0]

        doc = {
            "url": url_recv,
            "title": title_recv,
            "writer": user_info['nickname'],
            "date": date_recv,
            "image": image_recv,
            "tags": tags,
            "comments": [],
            "like": []
        }
        db.posts.insert_one(doc)
        return jsonify({"result": "success", 'msg': '게시물이 등록되었습니다.'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


# 댓글 작성
@app.route('/user/comment', methods=['POST'])
def user_comment():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"id": payload["id"]})

        id_recv = request.form["id_give"]
        comment_recv = request.form["comment_give"]
        date_recv = request.form["date_give"]

        doc = {
            "writer": user_info['nickname'],
            "user_id": payload['_id'],
            "comment": comment_recv,
            "date": date_recv
        }

        db.posts.update_one({'_id': ObjectId(id_recv)}, {'$push': {'comments': doc}})
        return jsonify({"result": doc, 'msg': '댓글이 등록되었습니다.'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


# 게시물 좋아요
@app.route('/user/post/like', methods=['POST'])
def user_post_like():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        id_recv = request.form['id_give']

        # 선택된 게시물의 좋아요 리스트를 불러옵니다.
        result = db.posts.find_one({'_id': ObjectId(id_recv)})['like']
        msg = True
        length = len(result)
        # 좋아요 리스트의 길이가 0이 아닐경우 실행됩니다.
        if len(result):
            for r in result:
                # 좋아요 리스트에 나와 같은 id가 있을 경우 좋아요 취소를 수행합니다.
                if r == payload['_id']:
                    msg = False
                    length -= 1
                    db.posts.update_one({'_id': ObjectId(id_recv)}, {'$pull': {'like': payload['_id']}})
                    return jsonify({"result": "success", 'bool': msg, 'post_len': length})
        # 좋아요 리스트의 길이가 0이거나 좋아요 리스트에 내가 없을 경우 좋아요를 수행합니다.
        length += 1
        db.posts.update_one({'_id': ObjectId(id_recv)}, {'$push': {'like': payload['_id']}})
        return jsonify({"result": "success", 'bool': msg, 'post_len': length})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


#게시물 검색
@app.route("/search", methods=['GET'])
def get_posts():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])

        key_recv = request.args['keyword']
        posts = list(db.posts.find())
        post_list = []

        #입력값이 빈 값일 때, 전체 출력
        # 돌이켜보니 이렇게 게시물 전체를 불러와서 가공할 필요가 없었을거 같음...
        # db에서 불러올 때, keyword와 tag값이 같은 것만 가져왔으면 됐지 않을까...
        if key_recv == "":
            for p in posts:
                p['likeMe'] = False
                p['_id'] = str(p['_id'])
                if payload['_id'] in p['like']:
                    p['likeMe'] = True
                post_list.append(p)
        else:
            for p in posts:
                p['likeMe'] = False
                if key_recv in p['tags']:
                    p['_id'] = str(p['_id'])
                    if payload['_id'] in p['like']:
                        p['likeMe'] = True
                    post_list.append(p)
        sorted_post = sorted(post_list, key=lambda x: (x['date']), reverse=True)
        return jsonify({"result": sorted_post})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))



if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)