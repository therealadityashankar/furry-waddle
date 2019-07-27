# start this with python3 test.py
from flask import Flask, request, make_response
import random

app = Flask(__name__)

@app.route('/', methods=['OPTIONS', 'POST'])
def foo():
    if request.method == 'OPTIONS':
        resp = make_response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return resp
    elif request.method == 'POST':
        print(request.get_json())
        if random.random() < 0.5:
            resp = make_response('test failure, this comes half the time, try again  to succeed', 401)
        else:
            resp = make_response('success', 200)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

app.run(debug=True, port="4567")
