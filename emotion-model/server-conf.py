#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: server-conf.py
# $Date: Sun Nov 16 01:42:16 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

port = 7007
arousal_model = './model_store/arousal.gbr.mdl'
valence_model = './model_store/valence.gbr.mdl'
feature_list_file = './config/feature.list'
temp_dir = './tmp'

# window size
ws = 0.5

# stride
st = 0.5

precomputed_results_dir = 'precomputed'

# vim: foldmethod=marker
