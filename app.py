from pymongo import MongoClient
import jwt
import datetime
import hashlib
import certifi
from flask import Flask, render_template, jsonify, request, redirect, url_for
from datetime import datetime, timedelta
from ignore import db


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
        return render_template('index.html', user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


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


# ID 중복확인
@app.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    userid_receive = request.form['userId_give']
    exists = bool(db.users.find_one({"id": userid_receive}))
    return jsonify({'result': 'success', 'exists': exists})


@app.route('/posting', methods=['POST'])
def posting():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        url_recv = request.form["url_give"]
        title_recv = request.form["title_give"]
        date_recv = request.form["date_give"]
        # 나중에 요기쯤에서 크롤링으로 해당 url의 썸네일을 가져와야함무라비
        image_recv = "https://tistory4.daumcdn.net/tistory/3830649/attach/1829f8675826466aa7cda4bbcc66ef2f"
        tag_recv = request.form["tag_give"]
        #태그를 #를 기준으로 분할합니다.
        tags = tag_recv.split('#')

        # doc = {
        #     "url": url_recv,
        #     "title": title_recv,
        #     "writer": user_info['nickname'],
        #     "date": date_recv,
        #     "image": image_recv,
        # }
        # db.posts.insert_one(doc)
        return jsonify({"result": "success", 'msg': '포스팅 성공'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


@app.route("/get_posts", methods=['GET'])
def get_posts():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # 포스팅 목록 받아오기
        return jsonify({"result": "success", "msg": "포스팅을 가져왔습니다."})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


@app.route('/update_like', methods=['POST'])
def update_like():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # 좋아요 수 변경
        return jsonify({"result": "success", 'msg': 'updated'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)