#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: __init__.py
# $Date: Sat Nov 15 17:20:18 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import sys

import numpy as np

from bregman.suite import wavread as _wavread
from contextlib import contextmanager
import time
import os
from itertools import izip
import functools
import inspect
from collections import Iterable

import logging
logger = logging.getLogger(__name__)

def wavread(path):
    ''':return: (signal, sampling_rate)'''
    return _wavread(path)[:2]


def read_by_line(path):
    with open(path, 'rb') as f:
        return [line.rstrip() for line in f]

class ProgressReporter(object):
    """report progress of long-term jobs"""
    _start_time = None
    _prev_report_time = 0
    _cnt = 0
    _name = None
    _total = None

    def __init__(self, name, total=0, fout=sys.stderr):
        self._start_time = time.time()
        self._name = name
        self._total = int(total)
        self._fout = fout

    @property
    def total_time(self):
        return time.time() - self._start_time

    def trigger(self, delta=1, extra_msg='', target_cnt=None):
        if target_cnt is None:
            self._cnt += int(delta)
        else:
            self._cnt = int(target_cnt)
        now = time.time()
        if now - self._prev_report_time < 0.5:
            return
        self._prev_report_time = now
        dt = now - self._start_time
        if self._total and self._cnt > 0:
            eta_msg = '{}/{} ETA: {:.2f}'.format(self._cnt, self._total,
                    (self._total-self._cnt)*dt/self._cnt)
        else:
            eta_msg = '{} done'.format(self._cnt)
        self._fout.write(u'{}: avg {:.3f}/sec'
                         u', passed {:.3f}sec, {}  {} \r'.format(
            self._name, self._cnt / dt, dt, eta_msg, extra_msg))
        self._fout.flush()

    def finish(self):
        """:return: total time"""
        self._fout.write('\n')
        self._fout.flush()
        return self.total_time


def safe_izip(*x):
    l = len(x[0])
    assert all(len(i) == l for i in x)
    return izip(*x)


def list2nparray(lst, dtype=None):
    """fast conversion from nested list to ndarray by pre-allocating space"""
    if isinstance(lst, np.ndarray):
        return lst
    assert isinstance(lst, (list, tuple)), 'bad type: {}'.format(type(lst))
    assert lst, 'attempt to convert empty list to np array'
    if isinstance(lst[0], np.ndarray):
        dim1 = lst[0].shape
        assert all(i.shape == dim1 for i in lst)
        if dtype is None:
            dtype = lst[0].dtype
            assert all(i.dtype == dtype for i in lst)
    elif isinstance(lst[0], (int, float, long, complex)):
        return np.array(lst, dtype=dtype)
    else:
        dim1 = list2nparray(lst[0])
        if dtype is None:
            dtype = dim1.dtype
        dim1 = dim1.shape
    shape = [len(lst)] + list(dim1)
    rst = np.zeros(shape, dtype=dtype)
    for idx, i in enumerate(lst):
        rst[idx] = i
    return rst


@contextmanager
def timed_operation(message):
    logger.info('start {} ...\n'.format(message))
    sys.stderr.flush()
    stime = time.time()
    yield
    logger.info('finished {}, time={:.2f}sec\n'.format(
        message, time.time() - stime))
    sys.stderr.flush()


def guard_exception(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            import traceback
            print 'Exception happened when calling function {}:'.format(
                func.__name__)
            traceback.print_exc()
    return wrapper



def take(n, iterator):
    ret = []
    if n > 0:
        for i, d in enumerate(iterator):
            ret.append(d)
            if i == n - 1:
                break
    return ret


# vim: foldmethod=marker
