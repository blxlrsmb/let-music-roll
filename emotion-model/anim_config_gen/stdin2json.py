#!/bin/env python2
# tot_len
# phase_start_time for 23 phases

tot_len = float(raw_input())
print '{'
print '  "id": "ooxx",'
print '  "time": {},'.format(tot_len)
print '  "phases" : ['
for i in range(23):
    t = float(raw_input())
    print '    {'
    print '      "start": {},'.format(t)
    print '      "config": {'
    print '        "phase": {},'.format(i + 1)
    print '        "beatfreq": 0.47'
    print '      }'
    if i == 22:
        print '    }'
    else:
        print '    },'
print '  ]'
print '}'
