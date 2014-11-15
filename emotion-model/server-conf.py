#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: server-conf.py
# $Date: Sun Nov 16 05:47:58 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import operator
import os
import subprocess
import json
from lmr.utils.fs import TempDir

import tempfile

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

BASE_DIR = os.path.dirname(os.path.realpath(__file__))


def _gen_get_config_input(result):
    ret = []
    last_a, last_v = None, None

    for r in result:
        timestamp = r[0]
        data = r[1]
        if 'arousal' not in data and 'valence' not in data:
            continue

        if 'arousal' in data:
            arousal = data['arousal']
        else: arousal = last_a

        if 'valence' in data:
            valence = data['valence']
        else: valence = last_a

        ret.append([timestamp, arousal, valence])

        last_a, last_v = arousal, valence

    return ret


def _gen_anim_conf(analyse_result):
    analyse_result = sorted(analyse_result, key=operator.itemgetter(0))
    config_input =  _gen_get_config_input(analyse_result)

    tdir = TempDir(temp_dir, remove_on_exit=False)
    cur_temp_dir = tdir.tempdir()
    cur_temp_dir = os.path.realpath(cur_temp_dir)

    get_config_input_path = os.path.join(
        cur_temp_dir, '___get_config_input.txt')

    with open(get_config_input_path, 'wb') as f:
        print >> f, len(config_input)
        for row in config_input:
            print >> f, ' '.join(map(str, row))

    anim_config_output = os.path.join(
        cur_temp_dir, '___anim_config_output.txt')

    RUN = os.path.join(BASE_DIR, 'anim_config_gen', 'run.sh')
    cmd = [
        RUN,
        get_config_input_path,
        anim_config_output
    ]

    with open('/tmp/hehehe', 'wb') as f:
        print >> f, ' '.join(cmd)

    subprocess.check_call(cmd)

    with open(anim_config_output) as f:
        return json.load(f)


animation_config_gen_method = _gen_anim_conf

# vim: foldmethod=marker
