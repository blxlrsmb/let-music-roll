#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: concurrency.py
# $Date: Sat Nov 15 21:48:24 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

from .iteration import pmap, pimap
import dill


class DilledFunction(object):
    def __init__(self, func):
        self._func_data = dill.dumps(func)

    def __call__(self, *args, **kwargs):
        dill.loads(self._func_data)(*args, **kwargs)


def parallel(*funcs):
    funcs = map(lambda f: DilledFunction(lambda x: f()), funcs)
    return pmap(funcs, range(len(funcs)))


# vim: foldmethod=marker
