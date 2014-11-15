#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: iteration.py
# $Date: Sat Nov 15 17:06:47 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import multiprocessing
from multiprocessing import Process, Queue
from collections import deque
import inspect
import dill


class MapWorker(object):
    def __init__(self, map_func):
        self.map_func = map_func

    def __call__(self, input_queue, output_queue):
        while True:
            task_id, args, kwargs = input_queue.get()
            output_queue.put((task_id, self.map_func(*args, **kwargs)))


class PickleableMethodProxy(object):
    def __init__(self, func):
        self.data = dill.dumps(func)
        return
        assert inspect.ismethod(func)
        self.im_self = func.im_self
        self.method_name = func.__name__

    def __call__(self, *args, **kwargs):
        return dill.loads(self.data)(*args, **kwargs)
        return getattr(self.im_self, self.method_name)(*args, **kwargs)


def islambda(func):
    return inspect.isfunction(func) and func.__name__ == '<lambda>'

def ensure_pickleable_func(func):
    if inspect.ismethod(func) or islambda(func):
        return PickleableMethodProxy(func)
    return func

def pimap(map_func, iterator, nr_proc=None, nr_precompute=None):
    map_func = ensure_pickleable_func(map_func)
    '''parallel imap'''
    if nr_proc is None:
        nr_proc = multiprocessing.cpu_count()
    if nr_precompute is None:
        nr_precompute = nr_proc * 2

    pool = multiprocessing.Pool(nr_proc)
    results = deque()
    for i in iterator:
        results.append(pool.apply_async(map_func, [i]))
        if len(results) == nr_precompute:
            yield results.popleft().get()
    for r in results:
        yield r.get()
    pool.close()
    pool.join()
    pool.terminate()


def pmap(map_func, iterator, nr_proc=None, nr_precompute=None):
    '''parallel map'''
    return list(pimap(map_func, iterator, nr_proc, nr_precompute))


def puimap(map_func, iterator, nr_proc=None, nr_precompute=None):
    '''parallel unordered imap'''
    if nr_proc is None:
        nr_proc = multiprocessing.cpu_count()
    if nr_precompute is None:
        nr_precompute = nr_proc * 2

    input_queue, output_queue = Queue(), Queue()
    worker = MapWorker(map_func)

    procs = [multiprocessing.Process(
            target=worker, args=(input_queue, output_queue))
            for i in xrange(nr_proc)]
    for proc in procs:
        proc.start()

    nr_inqueue = 0
    for i, param in enumerate(iterator):
        input_queue.put((i, [param], {}))
        nr_inqueue += 1
        if nr_inqueue == nr_precompute:  # TODO: aynchronous
            yield output_queue.get()[1]
            nr_inqueue -= 1

    while nr_inqueue > 0:
        yield output_queue.get()[1]
        nr_inqueue -= 1

    for proc in procs:
        proc.terminate()
        proc.join()


if __name__ == '__main__':

    from contextlib import contextmanager
    import sys
    import time

    @contextmanager
    def timed_operation(message):
        sys.stderr.write('start {} ...\n'.format(message))
        sys.stderr.flush()
        stime = time.time()
        yield
        sys.stderr.write('finished {}, time={:.2f}sec\n'.format(
            message, time.time() - stime))

    def map_func(arg):
        for i in xrange(100000):
            pass
        return arg

    while True:
        with timed_operation('one pass'):
            for i in pimap(map_func, xrange(1000), 8):
                pass

# vim: foldmethod=marker
