#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: inspect-pickled-obj.py
# $Date: Sat Nov 15 17:21:13 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

from lmr.utils import serial
from IPython import embed
import argparse


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(dest='file')
    args = parser.parse_args()

    obj = serial.load(args.file)
    print obj

    print 'loaded object is store in variable `obj\''

    embed()


# vim: foldmethod=marker
