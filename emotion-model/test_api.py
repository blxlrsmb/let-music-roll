#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: test_api.py
# $Date: Sat Nov 15 18:43:42 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import requests

import sys

def main():
    if len(sys.argv) == 1:
        sys.exit('Usage: {} <audio_file>'.format(
            sys.argv[0]))

    audio_file = sys.argv[1]

    print requests.post('http://localhost:7007/api/analyse',
                        files=dict(music=open(audio_file, 'rb'))).content


if __name__ == '__main__':
    main()

# vim: foldmethod=marker
