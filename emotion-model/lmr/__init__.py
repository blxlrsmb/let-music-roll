#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: __init__.py
# $Date: Sat Nov 15 17:06:06 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>


import logging
logging.basicConfig(
    format='\033[1;31m[%(asctime)s %(lineno)d@%(filename)s:%(name)s]\033[0m'
    ' %(message)s',
    datefmt='%d %H:%M:%S', level=logging.INFO)

# vim: foldmethod=marker

