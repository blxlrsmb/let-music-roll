#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: run_music_analyze_server.py
# $Date: Sun Nov 16 14:17:06 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

import json
import sys
import argparse
import os
import imp
import tempfile
import gc
import md5

import operator
import subprocess

import functools

import librosa
from flask import Flask, request, jsonify
import numpy as np

from lmr.features import extract as extract_feature
from lmr.utils import wavread, read_by_line, serial, ProgressReporter
from lmr.utils.fs import TempDir, mkdir_p
from lmr.utils.concurrency import parallel

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

def single_worker_call_member_method(obj, method_name, *args, **kwargs):
    return single_worker_apply(
        lambda: getattr(obj, method_name)(*args, **kwargs))

class bind(object):
    def __init__(self, func, *args, **kwargs):
        self.func = func
        self.args = args
        self.kwargs = kwargs

    def __call__(self):
        return self.func(*self.args, **self.kwargs)


class AnalyseError(Exception):
    pass


def exception_guard(func):
    @functools.wraps(func)
    def deco(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            import traceback
            return jsonify(dict(
                status='error',
                detail=e.message + traceback.format_exc()))
    return deco


class MusicAnalyseServer(object):
    def __init__(self, arousal_model, valence_model, feature_list,
                 temp_dir, precomputed_results_dir, port,
                 animation_config_gen_method,
                 ws=0.5, st=0.5):
        ''':param ws, st: (window_size, stride)'''
        self.app = Flask(__name__)
        self.arousal_model = self._load_model(arousal_model)
        self.valence_model = self._load_model(valence_model)
        self.feature_list = feature_list
        self.temp_dir = temp_dir
        self.precomputed_results_dir = precomputed_results_dir
        mkdir_p(precomputed_results_dir)
        self.precomputed_idx = set(os.listdir(precomputed_results_dir))
        self.port = port
        self.ws = ws
        self.st = st
        self.animation_gen_method = animation_config_gen_method
        self.build_app()

    def _hash_by_file_content(self, path):
        m = md5.new()
        with open(path, 'rb') as f:
            m.update(f.read())
        return m.hexdigest()

    def _json_load(self, f):
        if isinstance(f, basestring):
            with open(f, 'rb') as _f:
                return self._json_load(_f)
        return json.load(f)

    def _json_dump(self, obj, f):
        if isinstance(f, basestring):
            with open(f, 'wb') as _f:
                return self._json_dump(obj, _f)
        return json.dump(obj, f)

    def _load_precomputed(self, idx):
        path = os.path.join(self.precomputed_results_dir,
                            idx)
        return self._json_load(path)

    def _dump_computed(self, obj, idx):
        path = os.path.join(self.precomputed_results_dir,
                            idx)
        return self._json_dump(obj, path)

    def build_app(self):
        app = self.app

        @app.route('/api/get_animation_config_by_hash', methods=['GET'])
        def get_animation_config_by_hash():
            hash_idx = request.values.get('hash_idx', None)

            if hash_idx is None:
                ret = dict(status='error',
                           detail='No hash_idx param found.')
            else:
                analyse_result = self.get_analyse_result_by_hash(hash_idx)
                ret = self._gen_anim_conf_resp_data_by_analyse_result(
                    analyse_result, hash_idx)
            return jsonify(ret)

        @app.route('/api/get_animation_config_by_audio', methods=['POST'])
        @exception_guard
        def gen_animation_config_by_audio():
            temp_dir = TempDir(dir=self.temp_dir, remove_on_exit=False)
            audio_file = self.save_audio_on_request(temp_dir)

            hash_idx = self._hash_by_file_content(audio_file)
            logger.info('hash_idx: {}'.format(hash_idx))

            result = self.get_analyse_result_by_hash(hash_idx)
            if result is None:
                result = self._do_analyse(audio_file, temp_dir.tempdir())
                self._cache_analyse_result(result, hash_idx)

            ret = self._gen_anim_conf_resp_data_by_analyse_result(
                result, hash_idx)

            return jsonify(ret)

        @app.route('/api/analyse', methods=['POST'])
        @exception_guard
        def analyse():
            temp_dir = TempDir(dir=self.temp_dir, remove_on_exit=False)
            audio_file = self.save_audio_on_request(temp_dir)

            hash_idx = self._hash_by_file_content(audio_file)
            logger.info('hash_idx: {}'.format(hash_idx))

            result = self.get_analyse_result_by_hash(hash_idx)
            if result is not None:
                return jsonify(dict(status='success', data=result))

            result = self._do_analyse(audio_file, temp_dir.tempdir())
            self._cache_analyse_result(result, hash_idx)

            return jsonify(dict(
                status='success',
                data=result))

        ###### BUILD APPP END #####

    def _cache_analyse_result(self, result, hash_idx):
        result_path = os.path.join(self.precomputed_results_dir,
                                   hash_idx)

        self._dump_computed(result, hash_idx)
        self.precomputed_idx.add(hash_idx)


    def _gen_anim_conf_resp_data_by_analyse_result(
                self, analyse_result, hash_idx):
        if analyse_result is None:
            ret = dict(
                status='error',
                detail='Unable to find result for hash {}'.format(
                    hash_idx))
        else:
            try:
                animation_config = self.animation_gen_method(
                    analyse_result, hash_idx)
                if animation_config is None:
                    ret = dict(
                        status='error',
                        detail='Unable to generate animation config')
            except Exception as e:
                import traceback
                ret = dict(
                    status='error',
                    detail=traceback.format_exc())
            else:
                #analyse_result = self._populate_arousal_valence(analyse_result)
                ret = dict(status='success',
                           data=dict(
                               analyse_result=analyse_result,
                               config=animation_config
                           ))
        return ret

    def _weighted_average(self, x_pivot, data):
        weight_sum, accum = 0.0, 0.0
        for x, y in data:
            weight_sum += 1.0 / (1 + abs(x - x_pivot))
            accum += 1.0 / (1 + abs(x - x_pivot)) * y

        ret = accum / weight_sum
#         print x_pivot, data, ret
#         from IPython import embed; embed()
        return ret

    def _get_subseq(self, av, left, right, name):
        left = max(0, left)
        right = min(len(av) - 1, right)
        return [(t, r[name]) for t, r in av[left:right+1]]

    def _populate_arousal_valence(self, analyse_result):
        beats = filter(lambda r: 'beat' in r[1], analyse_result)

        av = filter(lambda r: 'beat' not in r[1], analyse_result)
        new_av = []
        NR_INSERT = 4
        for i, (ts, r) in enumerate(av):
            if i + 1 < len(av):
                new_av.append((ts, r))
                begin, end = av[i][0], av[i + 1][0]
                for j in xrange(NR_INSERT):
                    pivot = begin + (end - begin) * (j + 1) / float(NR_INSERT + 1)
                    a = self._weighted_average(pivot, self._get_subseq(
                        av, i - 5, i + 5, 'arousal'))
                    v = self._weighted_average(pivot, self._get_subseq(
                        av, i - 5, i + 5, 'valence'))
                    new_av.append([pivot, dict(arousal=a, valence=v)])
        new_av.append(av[-1])
        ret = list(sorted(beats + new_av, key=operator.itemgetter(0)))
        return ret

    def get_analyse_result_by_hash(self, hash_idx):
        ''':return: None if not found, otherwise the cached results'''
        if hash_idx in self.precomputed_idx:
            logger.info('precomputed result found for `{}\', '
                        'try loading...'.format(
                hash_idx))
            try:
                return self._load_precomputed(hash_idx)
            except Exception as e:
                logger.error('unable to load {}'.format(
                    hash_idx))
        return None

    def save_audio_on_request(self, temp_dir):
        '''save uploaded audio
        :return: audio file path'''

        file_storage = request.files['audio']
        tempdir = temp_dir.tempdir()
        filename = file_storage.filename
        audio_file = os.path.join(tempdir, filename)
        file_storage.save(audio_file)

        return audio_file


    def _do_analyse(self, audio_file, tempdir):
        ''':return: analyse result.
        may throw AnalyseError exception'''
        filename = os.path.basename(audio_file)
        wavfile_path = os.path.join(tempdir, filename + '.wav')

        logger.info('loading audio ...')
        x, fs = self.read_audio(audio_file, wavfile_path)
        logger.info('audio loaded.')

        duration = len(x) / float(fs)
        if duration >= 10 * 60:
            raise AnalyseError('music too long. analyse rejected.')

        # FIXME: unknown memory leak.
        # temporally fixed by computing in another process
        # and turn it off to release memories

        emotion_series, beat_series = parallel(
            bind(single_worker_call_member_method,
                self, '_emotion_analyse', x, fs),
            bind(single_worker_call_member_method,
                self, '_beat_analyses', x, fs))


        result = list(sorted(emotion_series + beat_series,
                       key=operator.itemgetter(0)))

        return result

    def _read_precomputed_results(self, dirname):
        ret = dict()
        for fname in os.listdir(dirname):
            fpath = os.path.join(dirname, fname)
            with open(fpath, 'rb') as f:
                ret[fname] = json.load(f)
        return ret


    def xrangef(self, begin, end, step):
        i = 0.0
        while i < end:
            yield i
            i += step

    def rangef(self, begin, end, step):
        return list(self.xrangef(begin, end, step))

    def _emotion_analyse(self, x, fs):
        X = self._extract_features(x, fs)

        logger.info('predicting arousal using model `{}\''.format(
            self.arousal_model.__class__.__name__))
        arousals = self.arousal_model.predict(X)

        logger.info('predicting valence using model `{}\''.format(
            self.valence_model.__class__.__name__))
        valences = self.valence_model.predict(X)

        timing = self.rangef(0, len(x) / float(fs), self.st)
        cur = 0.0
        assert len(timing) == len(arousals)

        ret = [[t, dict(arousal=arousal, valence=valence)]
                for t, arousal, valence in zip(timing, arousals, valences)]
        gc.collect()
        return ret

    def _beat_analyses(self, x, fs):
        y_harmonic, y_percussive = librosa.effects.hpss(x)

        temp, beats = librosa.beat.beat_track(
            y=y_percussive, sr=fs, hop_length=64)
        beats_time = librosa.frames_to_time(beats, sr=fs, hop_length=64)
        beats_time = [(t, dict(beat=1)) for t in beats_time]
        return beats_time

    def _analyze_music(self, x, fs):
        logger.info('analysing emotion ...')
        emotion_series = self._emotion_analyse(x, fs)
        logger.info('analysing beats...')
        beat_series = self._beat_analyses(x, fs)

        return list(sorted(emotion_series + beat_series,
                           key=operator.itemgetter(0)))

    def _load_model(self, model):
        if isinstance(model, basestring):
            return serial.load(model)
        return model

    def _extract_features(self, x, fs):
        Xs = []
        for feat_name, X in izip(self.feature_list,
                     pimap(lambda feat_name: extract_feature(
                         feat_name, self.ws, self.st, x, fs),
                     self.feature_list, nr_proc=2)):
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
            logger.info('direct read of `{}\' failed'.format(fname))

        cmd =  ['ffmpeg', '-i', fname, temp_wavfile]
        logger.info(cmd)
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
        precomputed_results_dir=config.precomputed_results_dir,
        ws=config.ws, st=config.st,
        animation_config_gen_method=config.animation_config_gen_method)

    server.app.debug = True
    server.run()

if __name__ == '__main__':
    main()

# vim: foldmethod=marker
