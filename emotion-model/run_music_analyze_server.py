#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: run_music_analyze_server.py
# $Date: Sat Nov 15 21:48:31 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import json
import sys
import argparse
import os
import imp
import tempfile
import gc

import subprocess

import librosa
from flask import Flask, request, jsonify
import numpy as np

from lmr.features import extract as extract_feature
from lmr.utils import wavread, read_by_line, serial, ProgressReporter
from lmr.utils.fs import TempDir
from lmr.utils import concurrency

from lmr.utils.iteration import pimap
from itertools import imap, izip

from multiprocessing import Pool, Process, Queue

import dill

import logging
logger = logging.getLogger(__name__)

def run_dilled_func(func_data, result_queue):
    func = dill.loads(func_data)
    result_queue.put(func())

def single_worker_apply(func):
    func_data = dill.dumps(func)
    queue = Queue()
    proc = Process(target=run_dilled_func, args=(func_data, queue))
    proc.start()
    result = queue.get()
    proc.terminate()
    proc.join()
    return result


def analyse_worker(server, x, fs):
    return single_worker_apply(lambda: server._analyze_music(x, fs))

class MusicAnalyseServer(object):
    def __init__(self, arousal_model, valence_model, feature_list,
                 temp_dir, port, ws=0.5, st=0.5):
        ''':param ws, st: (window_size, stride)'''
        self.app = Flask(__name__)
        self.arousal_model = self._load_model(arousal_model)
        self.valence_model = self._load_model(valence_model)
        self.feature_list = feature_list
        self.temp_dir = temp_dir
        self.port = port
        self.ws = ws
        self.st = st

        self.build_app()

    def build_app(self):
        app = self.app

        @app.route('/api/analyse', methods=['POST'])
        def analyse():
            print self.temp_dir
            temp_dir = TempDir(dir=self.temp_dir, remove_on_exit=False)
            file_storage = request.files['music']

            tempdir = temp_dir.tempdir()
            filename = file_storage.filename
            audio_file = os.path.join(tempdir, filename)
            file_storage.save(audio_file)

            wavfile_path = os.path.join(tempdir, filename + '.wav')

            x, fs = self.read_audio(audio_file, wavfile_path)

            duration = len(x) / float(fs)
            if duration >= 4 * 60:
                return dict(status='error',
                            message='music too long. analyse rejected.')

            # FIXME: unknown memory leak.
            # temporally fixed by computing in another process
            # and turn it off to release memories
            result = analyse_worker(self, x, fs)

            return jsonify(dict(
                status='success',
                data=result))

#             from IPython import embed; embed()
#             return jsonify(result)


    def xrangef(self, begin, end, step):
        i = 0.0
        while i < end:
            yield i
            i += step

    def rangef(self, begin, end, step):
        return list(self.xrangef(begin, end, step))

    def _emotion_analyse(self, x, fs):
        X = self._extract_features(x, fs)

        arousals = self.arousal_model.predict(X)
        valences = self.valence_model.predict(X)
        timing = self.rangef(0, len(x) / float(fs), self.st)
        cur = 0.0
        assert len(timing) == len(arousals)

        ret = [[t, dict(arousal=arousal, valence=valence)]
                for t, arousal, valence in zip(timing, arousals, valences)]
        gc.collect()
        return ret

    def _beat_analyses(self, x, fs):
        print 1
        print len(x), fs
        y_harmonic, y_percussive = librosa.effects.hpss(x)

        print 2
        temp, beats = librosa.beat.beat_track(
            y=y_percussive, sr=fs, hop_length=64)
        print 3
        beats_time = librosa.frames_to_time(beats, sr=fs, hop_length=64)
        print 4
        from IPython import embed; embed()
        return beats_time

    def _analyze_music(self, x, fs):
#         emotion_series = self._emotion_analyse(x, fs)
        beat_series = self._beat_analyses(x, fs)
        return beat_series
        return list(sorted(emotion_series + beat_series))

    def _load_model(self, model):
        if isinstance(model, basestring):
            return serial.load(model)
        return model

    def _extract_features(self, x, fs):
        Xs = []
        for feat_name, X in izip(self.feature_list,
                     pimap(lambda feat_name: extract_feature(
                         feat_name, self.ws, self.st, x, fs),
                     self.feature_list)):
            logger.info('feature `{}\' generated'.format(feat_name))
            Xs.append(X)
        return np.hstack(Xs)

    def _do_extract_feature(self, feat_name, x, fs):
        return extract_features(feat_name, self.ws, self.st, x, fs)

    def run(self):
        self.app.run('0.0.0.0', self.port)

    def read_audio(self, fname, temp_wavfile):
        try:
            return wavread(fname)
        except:
            pass

        cmd =  ['ffmpeg', '-i', fname, temp_wavfile]
        print cmd
        subprocess.check_call(cmd)

        return wavread(temp_wavfile)



def load_config(path):
    return imp.load_source('config', path)

def main():
    if len(sys.argv) < 2:
        sys.exit('Usage: {} <config_file> [<key:type:val>, ...]'.format(
            sys.argv[0]))

    config_path = sys.argv[1]
    updates = sys.argv[2:]

    config = load_config(config_path)

    typecvt = dict(
        int=int, float=float, str=str,
        i=int, f=float, s=str)

    for update in updates:
        key, typ, val = update.split(':')
        if not hasattr(config, key):
            raise RuntimeError('config does not have attribute: {}'.format(
                key))
        if typ not in typecvt:
            raise RuntimeError('invalid type specifier: `{}\''.format(typ))
        typ = typecvt[typ]
        setattr(config, key, typ(val))

    server = MusicAnalyseServer(
        arousal_model=config.arousal_model,
        valence_model=config.valence_model,
        feature_list=read_by_line(config.feature_list_file),
        temp_dir=config.temp_dir, port=config.port,
        ws=config.ws, st=config.st)

    server.app.debug = True
    server.run()

if __name__ == '__main__':
    main()

# vim: foldmethod=marker
