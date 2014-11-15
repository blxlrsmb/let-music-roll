#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# $File: __init__.py
# $Date: Sat Nov 15 00:58:26 2014 +0800
# $Author: Xinyu Zhou <zxytim[at]gmail[dot]com>

from bregman import suite, features

def _bregman(clsname, ws, st):
    '''
    generate a bregman-based feature extractor
    :param ws: window size, in seconds
    :parma st: stride, in seconds
    :return: function(x, fs) -> array(frames, feature_dim) '''
    def extract(x, fs):
        ''':return: features of shape (frames, feature_dim)'''
        cls = getattr(features, clsname)
        nfft = fs
        wfft = int(fs * ws)
        nhop = int(fs * st)
        return cls(x, sample_rate=fs, nfft=fs, wfft=wfft, nhop=nhop).X.T

    return extract


_FEAT_NAME2CLASS_NAME = dict(
    mfcc='LogFrequencyCepstrum',
    cqft='LogFrequencySpectrum',
    stft='LinearFrequencySpectrum',
    chroma='Chromagram',
    hchroma='HighQuefrencyChromagram',
    lcqft='LowQuefrencyLogFrequencySpectrum',
    hcqft='HighQuefrencyLogFrequencySpectrum',
    rms='RMS',
    lpower='LinearPower',
    dbpower='dBPower',
)


def available_feature_names():
    return _FEAT_NAME2CLASS_NAME.keys()


def extract(feat_name, ws, st, x, fs):
    ''':param feat_name: feature name.
        :param ws: window size, in seconds
        :parma st: stride, in seconds
        :return: features of shape (frames, feature_dim)
    '''
    assert feat_name in _FEAT_NAME2CLASS_NAME
    clsname = _FEAT_NAME2CLASS_NAME[feat_name]
    extractor = _bregman(clsname, ws, st)

    X = extractor(x, fs)
    if X.ndim == 1:
        X = X.reshape(X.shape[0], 1)
    return X


# vim: foldmethod=marker
