#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: 01_extract_labels.py
# $Date: Sat Nov 15 17:23:17 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import argparse
import os
import csv

from neupack.utils import serial, fs

import logging
logger = logging.getLogger(__name__)


def read_label_csv(path):
    ret = dict()
    with open(path) as f:
        rows = [row for row in csv.reader(f)]
        for row in rows[1:]:
            song_name = row[0] + '.wav'
            data = map(float, row[1:])
            ret[song_name] = data
    return ret


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--input-csv', required=True)
    parser.add_argument('-o', '--output-dir', required=True)

    args = parser.parse_args()

    fs.mkdir_p(args.output_dir)

    labels = read_label_csv(args.input_csv)
    for song_name, val in labels.iteritems():
        output_path = os.path.join(args.output_dir, song_name)
        serial.dump(val, output_path)


if __name__ == '__main__':
    main()

# vim: foldmethod=marker
