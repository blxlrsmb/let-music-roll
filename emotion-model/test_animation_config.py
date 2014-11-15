#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: test_animation_config.py
# $Date: Sun Nov 16 03:48:36 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>


import requests

import sys

def main():
    if len(sys.argv) == 1:
        sys.exit('Usage: {} <hash_idx>'.format(
            sys.argv[0]))

    hash_idx = sys.argv[1]

    print requests.get(
        'http://localhost:7007/api/get_animation_config_by_hash',
        params=dict(hash_idx=hash_idx)).content


if __name__ == '__main__':
    main()

# vim: foldmethod=marker


# vim: foldmethod=marker

