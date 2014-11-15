#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: test.py
# $Date: Sat Nov 15 18:35:16 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

from bregman import suite

from lmr.utils import wavread
from lmr.preproc import ensure_signal_duration
from lmr.features import extract

from neupack.utils import timed_operation


x, fs = wavread('./Data/10.wav')
x = ensure_signal_duration(x, fs, 45)

X = extract('stft', ws=0.5, st=0.5, x=x, fs=fs)

from IPython import embed; embed()

# vim: foldmethod=marker
