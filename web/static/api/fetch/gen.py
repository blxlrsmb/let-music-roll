#!/usr/bin/env python2
# -*- coding: UTF-8 -*-
# File: gen.py
# Date: Sat Nov 15 23:01:52 2014 +0800
# Author: Yuxin Wu <ppwwyyxxc@gmail.com>

x = {}
x['id'] = 'ooxx'
x['time'] = 100

phases = []

start = [5 + k * 5 for k in range(23)]
phases_touse = range(1, 24)

phases_touse = [1,2,3,13,14,17,18,19,20,21,22,17,18,19,20,21,22,23]

beats = [0.5] * 23
beats[3] = 1
beats[4] = 1
beats[5] = 1

for time, phase,beat in zip(start, phases_touse, beats):
    obj = {}
    obj['start'] = time
    cfg = {}
    cfg['phase'] = phase
    cfg['beatfreq'] = beat
    obj['config'] = cfg
    phases.append(obj)

x['phases'] = phases

import json
f = open('test.json', 'w')
json.dump(x, f)
