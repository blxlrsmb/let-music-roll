#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: fs.py
# $Date: Sat Nov 08 01:14:19 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import os

def mkdir_p(dirname):
    try:
        os.makedirs(dirname)
    except OSError as e:
        if e.errno != 17:
            raise e

# vim: foldmethod=marker
