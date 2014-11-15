#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: serial.py
# $Date: Sat Nov 15 01:22:51 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import cPickle as pickle
import random
import os
import shutil

_RANDFILE_CHARSET = ('qwertyyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM'
    '1234567890:-_=+|@')


def rand_filename(length=16, charset=_RANDFILE_CHARSET):
    return ''.join(random.choice(charset) for i in xrange(length))


def load(fobj, require_type=None):
    """load from file
    :param fobj: file obj or file path"""
    if isinstance(fobj, basestring):
        with open(fobj, 'rb') as fin:
            obj = load(fin)
    else:
        obj = pickle.load(fobj)
    if require_type is not None:
        assert isinstance(obj, require_type), \
            '{} from {} is not an instance of {}'.format(
                type(obj), fobj, require_type)
    return obj


def dump(obj, fobj):
    """dump to file.
    :param fobj: file obj or file path. if it is a file path,
    it will be saved to a temporary file in the same directory
    and then move to destination"""
    if isinstance(fobj, basestring):
        tmp_fobj = fobj + rand_filename()
        with open(tmp_fobj, 'wb') as fout:
            dump(obj, fout)
        shutil.move(tmp_fobj, fobj)
    else:
        pickle.dump(obj, fobj, pickle.HIGHEST_PROTOCOL)


def load_cached_if_exists(path, compute):
    if os.path.isfile(path):
        return load(path)
    obj = compute()
    dump(obj, path)
    return obj


# vim: foldmethod=marker
