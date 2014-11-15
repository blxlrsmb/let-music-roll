#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: __init__.py
# $Date: Sat Nov 15 00:55:34 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import numpy as np


def ensure_signal_duration(x, fs, duration):
    expect = int(fs * duration)
    if len(x) < expect:
        return np.concatenate((x, np.zeros(expect - len(x))))
    return x[:expect]


# vim: foldmethod=marker

