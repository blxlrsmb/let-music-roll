#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: 03_train.py
# $Date: Sat Nov 15 17:25:01 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

from sklearn.linear_model import LinearRegression
from sklearn import metrics
from lmr.utils import serial
from lmr.learn import split_data

import argparse

_MODEL_DICT = dict(
    lr=LinearRegression)

def get_model(name, *args, **kwargs):
    assert name in _MODEL_DICT, 'unrecognized model name: `{}\''.format(name)
    return _MODEL_DICT[name](*args, **kwargs)


def evaluate(mdl, X, y_true, metric_names=['mean_squared_error']):
    y_pred = mdl.predict(X)
    for mname in metric_names:
        score = getattr(metrics, mname)(y_true, y_pred)
        print '{}: {}'.format(mname, score)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--pickled-data', required=True)
    parser.add_argument('-r', '--train-ratio', default=0.8, type=float)
    parser.add_argument('-m', '--model-name', required=True,
                        help='sklearn model names')
    parser.add_argument('-o', '--model-output', required=True)
    args = parser.parse_args()

    X, y = serial.load(args.pickled_data)
    X_train, y_train, X_val, y_val = split_data(X, y, args.train_ratio)

    mdl = get_model(args.model_name)
    mdl.fit(X_train, y_train)

    serial.dump(mdl, args.model_output)

    print 'on training set:'
    evaluate(mdl, X_train, y_train)
    print 'on evaluation set:'
    evaluate(mdl, X_val, y_val)



if __name__ == '__main__':
    main()

# vim: foldmethod=marker
