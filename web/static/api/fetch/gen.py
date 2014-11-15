#!/usr/bin/env python2
# -*- coding: UTF-8 -*-
# File: gen.py
# Date: Sat Nov 15 21:58:35 2014 +0800
# Author: Yuxin Wu <ppwwyyxxc@gmail.com>

x = {}
x['id'] = 'ooxx'
x['time'] = 100

phases = []

start = [5 + k * 5 for k in range(23)]
phases_touse = range(1, 24)

phases_touse = [1,2,3,14,15, 16,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]

for time, phase in zip(start, phases_touse):
    obj = {}
    obj['start'] = time
    cfg = {}
    cfg['phase'] = phase
    cfg['beatfreq'] = 0.5
    obj['config'] = cfg
    phases.append(obj)

x['phases'] = phases

import json
f = open('test.json', 'w')
json.dump(x, f)
