#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: __init__.py
# $Date: Sat Nov 15 17:15:47 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import numpy as np
from ..utils import wavread


def ensure_signal_duration(x, fs, duration):
    expect = int(fs * duration)
    if len(x) < expect:
        return np.concatenate((x, np.zeros(expect - len(x))))
    return x[:expect]


def wavread_ensure_signal_duration(path, duration):
    x, fs = wavread(path)
    x = ensure_signal_duration(x, fs, duration)
    return x, fs

# vim: foldmethod=marker

