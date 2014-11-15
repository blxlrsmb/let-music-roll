#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: __init__.py
# $Date: Sat Nov 15 17:20:09 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>


def split_data(X, y, train_ratio):
    ''':return: (X_train, y_train, X_val, y_val)'''
    assert len(X) == len(y)
    nr_train = max(1, int(len(X) * train_ratio))
    nr_val = len(X) - nr_train
    assert nr_val > 0, 'too few data to setup a validation: {}'.format(nr_val)
    X_train, y_train = X[:nr_train], y[:nr_train]
    X_val, y_val = X[nr_train:], y[nr_train:]

    return X_train, y_train, X_val, y_val



# vim: foldmethod=marker

