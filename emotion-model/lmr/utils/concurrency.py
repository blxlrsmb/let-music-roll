#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: concurrency.py
# $Date: Sun Nov 16 01:33:51 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

from .iteration import pmap, pimap
import dill


class DilledFunction(object):
    def __init__(self, func):
        self._func_data = dill.dumps(func)

    def __call__(self, *args, **kwargs):
        return dill.loads(self._func_data)(*args, **kwargs)


class __dummy_func(object):
    def __init__(self, func):
        self.func = func
    def __call__(self, *args, **kwargs):
        return self.func()

def parallel(*funcs):
    funcs = map(lambda f: DilledFunction(__dummy_func(f)), funcs)
    return [f(v) for f, v in zip(funcs, range(len(funcs)))]


# vim: foldmethod=marker
