#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: __init__.py
# $Date: Sat Nov 15 01:20:54 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>


from bregman.suite import wavread as _wavread

def wavread(path):
    ''':return: (signal, sampling_rate)'''
    return _wavread(path)[:2]


def read_by_line(path):
    with open(path, 'rb') as f:
        return [line.rstrip() for line in f]

# vim: foldmethod=marker
