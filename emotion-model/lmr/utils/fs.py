#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: fs.py
# $Date: Sat Nov 15 18:42:52 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import os
import tempfile
import shutil

import logging
logger = logging.getLogger(__name__)

def mkdir_p(dirname):
    try:
        os.makedirs(dirname)
    except OSError as e:
        if e.errno != 17:
            raise e

class TempDir(object):
    def __init__(self, dir=None, remove_on_exit=True):
        mkdir_p(dir)
        self.dirname = tempfile.mkdtemp(dir=dir)
        self.remove_on_exit = remove_on_exit
        if self.remove_on_exit == False:
            logger.warn(
                'temporary directory `{}\' will not be removed'.format(
                self.dirname))

    def tempfile(self, **kwargs):
        ''':return: path'''
        return tempfile.mkstemp(dir=self.dirname, **kwargs)[1]

    def tempdir(self, **kwargs):
        ''':return: path'''
        return tempfile.mkdtemp(dir=self.dirname, **kwargs)

    def __del__(self):
        if self.remove_on_exit:
            shutil.rmtree(self.dirname, ignore_errors=True)



# vim: foldmethod=marker
