#!/usr/bin/env python2
# -*- coding: UTF-8 -*-
# File: app.py
# Date: Sat Nov 15 14:29:58 2014 +0800
# Author: Yuxin Wu <ppwwyyxxc@gmail.com>

from flask import Flask, request
from werkzeug import secure_filename
app = Flask(__name__)
app.debug = True


ALLOWED_SUFFIX = ['mp3', 'wma', 'wav']
def allowed_filename(filename):
    return any([filename.endswith('.' + k) for k in ALLOWED_SUFFIX])

@app.route('/upload', methods=['POST'])
def upload():
    f = request.files['music']
    if f and allowed_filename(f.filename):
        filename = secure_filename(f.filename)
        # a opened file handler
        music_file = f.stream
        # TODO
    return "Hello world"


if __name__ == '__main__':
    app.run('0.0.0.0', 3000)
