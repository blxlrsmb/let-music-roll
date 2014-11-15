#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: 02_generate_dataset.py
# $Date: Sat Nov 15 17:20:52 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import argparse

import os
import numpy as np

from lmr.preproc import ensure_signal_duration
from lmr.utils import wavread, read_by_line, serial, iteration, fs, \
    list2nparray
from lmr.features import extract as extract_feature


import logging
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-l', '--feature-prefix-list', required=True)
    parser.add_argument('-f', '--feature-list', required=True,
                        help='file that contains feature definitions, '
                        'one each line')
    parser.add_argument('-d', '--label-dir', required=True)
    parser.add_argument('-o', '--output-path', required=True)
    args = parser.parse_args()

    feature_prefix_list = read_by_line(args.feature_prefix_list)
    feature_names = read_by_line(args.feature_list)

    X = []
    y = []
    for prefix in feature_prefix_list:

        feats = []
        for feat_name in feature_names:
            feat_path = '{}.{}.pkl'.format(prefix, feat_name)
            feats.append(serial.load(feat_path))
        feats = np.hstack(feats)

        basename = os.path.basename(prefix)
        label_path = os.path.join(args.label_dir, basename)

        labels = np.asarray(serial.load(label_path))

        feats = feats[-len(labels):]
        X.extend(feats)
        y.extend(labels)

    serial.dump((list2nparray(X), list2nparray(y)), args.output_path)


if __name__ == '__main__':
    main()

# vim: foldmethod=marker

