#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: server-conf.py
# $Date: Sat Nov 15 18:43:33 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

port = 7007
arousal_model = './model_store/arousal.lr.mdl'
valence_model = './model_store/valence.lr.mdl'
feature_list_file = './config/feature.list'
temp_dir = './tmp'

# window size
ws = 0.5

# stride
st = 0.5

# vim: foldmethod=marker

