#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std;

// v is discarded
struct Entry {
    float t;
    float a, v;
};

vector<Entry> vec;
vector<Entry> nms;
vector<Entry> ones;
int n;

void get_nms(const vector<Entry> &vec, vector<Entry> &nms, const int WSIZE, bool flip)
{
    nms.clear();
    for (int i = 0; i < vec.size(); ++i) {
        vector<float> W;
        for (int j = i - WSIZE / 2; j < i + WSIZE / 2; ++j) {
            if (j >= 0 && j < (int)vec.size()) {
                W.push_back(vec[j].a);
            }
        }
        float sumW = 0;
        for (auto x : W) sumW += x;
        float avgW = sumW / W.size();
        if (flip) {
            float maxW = -1e9;
            for (auto x : W) if (x > maxW) maxW = x;
            Entry e;
            e.t = vec[i].t;
            e.a = vec[i].a / maxW;
            e.v = 0;
            nms.push_back(e);
        } else {
            float minW = 1e9;
            for (auto x : W) if (x < minW) minW = x;
            Entry e;
            e.t = vec[i].t;
            e.a = vec[i].a / minW;
            e.v = 0;
            nms.push_back(e);
        }
    }
}

void get_potential_ones(const vector<Entry> &vec, vector<Entry> &nms, vector<Entry> &ones, int wsize, float left, float right, float interval, bool flip = false)
{
    get_nms(vec, nms, wsize, flip);
    vector<Entry> cand_ones;
    ones.clear();
    for (auto x : nms) if (x.a == 1) {
        cand_ones.push_back(x);
    }
    for (int i = 0; i < cand_ones.size(); ++i) {
        if (cand_ones[i].t > left && cand_ones[i].t < right) {
            if (ones.size() == 0 || cand_ones[i].t - ones[ones.size() - 1].t > interval) {
                ones.push_back(cand_ones[i]);
            }
        }
    }
}

int main()
{
    scanf("%d", &n);
    for (int i = 0; i < n; ++i) {
        Entry entry;
        scanf("%f%f%f", &entry.t, &entry.a, &entry.v);
        entry.a += 1;
        vec.push_back(entry);
    }
    //
    //smooth
    /*
    vector<float> tmp(n);
    for (int i = 0; i < n; ++i) {
        int size = 1;
        vector<float> x;
        for (int j = i - size; j < i + size; ++j) {
            if (j >= 0 && j < n) x.push_back(vec[j].a);
        }
        float sum = 0;
        for (auto t : x) sum += t;
        tmp[i] = sum / x.size();
    }
    for (int i = 0; i < n; ++i) vec[i].a = tmp[i];
    */
    //
    float tot_time = vec[vec.size() - 1].t;
    int wsize_l = 1, wsize_r = 500;
    while (wsize_l + 1 < wsize_r) {
        int wsize = (wsize_l + wsize_r) / 2;
        get_potential_ones(vec, nms, ones, wsize, tot_time / 10, tot_time / 10 * 9, tot_time / 10);
        int countone = ones.size();
        //printf("%d,%d\n", wsize, countone);
        if (countone >= 3) wsize_l = wsize; else wsize_r = wsize;
    }
    int wsize = wsize_l;
    get_potential_ones(vec, nms, ones, wsize, tot_time / 10, tot_time / 10 * 9, tot_time / 10);
    vector<float> ans;
    ans.resize(22);
    //fprintf(stderr, "found %lu potential nms 1s\n", ones.size());
    ans[6] = ones[0].t;
    ans[12] = ones[1].t;
    ans[15] = ones[2].t;

    // 0..6
    {
        vector<Entry> cvec;
        for (int i = 0; i < vec.size(); ++i) if (vec[i].t < ans[6])
            cvec.push_back(vec[i]);
        float interval = ans[6] / 20;
        float left = 0;
        float right = ans[6] - interval;
        int wsize_l = 1, wsize_r = 500;
        while (wsize_l + 1 < wsize_r) {
            int wsize = (wsize_l + wsize_r) / 2;
            get_potential_ones(cvec, nms, ones, wsize, left, right, interval, 0);
            if (ones.size() >= 6) wsize_l = wsize; else wsize_r = wsize;
        }
        wsize = wsize_l;
        get_potential_ones(cvec, nms, ones, wsize, left, right, interval, 0);
        for (int i = 0; i < 6; ++i) ans[i] = ones[i].t;
    }
    // 6..12
    {
        vector<Entry> cvec;
        for (int i = 0; i < vec.size(); ++i) if (vec[i].t > ans[6] && vec[i].t < ans[12])
            cvec.push_back(vec[i]);
        float interval = (ans[12] - ans[6]) / 20;
        float left = ans[6] + interval;
        float right = ans[12] - interval;
        int wsize_l = 1, wsize_r = 500;
        while (wsize_l + 1 < wsize_r) {
            int wsize = (wsize_l + wsize_r) / 2;
            get_potential_ones(cvec, nms, ones, wsize, left, right, interval, 0);
            if (ones.size() >= 5) wsize_l = wsize; else wsize_r = wsize;
        }
        wsize = wsize_l;
        get_potential_ones(cvec, nms, ones, wsize, left, right, interval, 0);
        for (int i = 0; i < 5; ++i) ans[i + 7] = ones[i].t;
    }
    // 12..15
    {
        vector<Entry> cvec;
        for (int i = 0; i < vec.size(); ++i) if (vec[i].t > ans[12] && vec[i].t < ans[15])
            cvec.push_back(vec[i]);
        float interval = (ans[15] - ans[12]) / 20;
        float left = ans[12] + interval;
        float right = ans[15] - interval;
        int wsize_l = 1, wsize_r = 500;
        while (wsize_l + 1 < wsize_r) {
            int wsize = (wsize_l + wsize_r) / 2;
            get_potential_ones(cvec, nms, ones, wsize, left, right, interval, 0);
            if (ones.size() >= 2) wsize_l = wsize; else wsize_r = wsize;
        }
        wsize = wsize_l;
        get_potential_ones(cvec, nms, ones, wsize, left, right, interval, 0);
        for (int i = 0; i < 2; ++i) ans[i + 13] = ones[i].t;
    }
    // 15..21
    {
        vector<Entry> cvec;
        for (int i = 0; i < vec.size(); ++i) if (vec[i].t > ans[15])
            cvec.push_back(vec[i]);
        float interval = (tot_time - ans[15]) / 20;
        float left = ans[15] + interval;
        float right = tot_time;
        int wsize_l = 1, wsize_r = 500;
        while (wsize_l + 1 < wsize_r) {
            int wsize = (wsize_l + wsize_r) / 2;
            get_potential_ones(cvec, nms, ones, wsize, left, right, interval, 0);
            if (ones.size() >= 6) wsize_l = wsize; else wsize_r = wsize;
        }
        wsize = wsize_l;
        get_potential_ones(cvec, nms, ones, wsize, left, right, interval, 0);
        for (int i = 0; i < 6; ++i) ans[i + 16] = ones[i].t;
    }
    printf("%f\n", tot_time);
    for (int i = 0; i < 22; ++i) printf("%f\n", ans[i]);
    printf("%f\n", tot_time);
}
