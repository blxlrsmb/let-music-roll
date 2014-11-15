#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: 00_extract_features.py
# $Date: Sat Nov 15 17:16:03 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import argparse

import os
import gc
import numpy as np

from lmr.preproc import ensure_signal_duration, wavread_ensure_signal_duration
from lmr.utils import wavread, read_by_line, serial, iteration, fs, \
    ProgressReporter
from lmr.features import extract as extract_feature


import logging
logger = logging.getLogger(__name__)


def process_music(music_path, feat_names, ws, st, output_prefix):
    logger.info('processing music {} ...'.format(music_path))

    x, fs = wavread_ensure_signal_duration(music_path, 45)

    for name in feat_names:
        output_path = '{}.{}.pkl'.format(
            output_prefix, name)
        if os.path.exists(output_path):
            logger.info('{} already exists. skip'.format(output_path))
            continue
        X = extract_feature(name, ws, st, x, fs)
        serial.dump(X, output_path)
        logger.info('{} generated'.format(output_path))

        gc.collect()



def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-l', '--music-list', required=True,
                        help='list of 45 secs long data')
    parser.add_argument('-f', '--feature-list', required=True,
                        help='file that contains feature definitions, '
                        'one each line')
    parser.add_argument('-w', '--window-size', default=0.5, type=float,
                        help='window size (that comprises a frame) used '
                        'to extract feature, in seconds')
    parser.add_argument('-s', '--stride', default=0.5, type=float,
                        help='frame moving stride, in seconds')
    parser.add_argument('-o', '--output-dir', required=True)
    args = parser.parse_args()

    music_path_list, feature_list = map(read_by_line,
                                        [args.music_list, args.feature_list])

    fs.mkdir_p(args.output_dir)

    generator = iteration.pimap(
        lambda mf: process_music(
            mf[0], mf[1] , args.window_size, args.stride,
            os.path.join(args.output_dir,
                         os.path.basename(mf[0]))),
        zip(music_path_list, [feature_list] * len(music_path_list)))

    prog = ProgressReporter('generate features', total=len(music_path_list))
    for i in generator:
        prog.trigger()
    prog.finish()

if __name__ == '__main__':
    main()

# vim: foldmethod=marker
