#!/bin/bash -e
# File: test-upload.sh
# Date: Sat Nov 15 14:30:33 2014 +0800
# Author: Yuxin Wu <ppwwyyxxc@gmail.com>

MUSIC=$1
HOST="http://localhost:3000/upload"
curl -vvv -F music=@$MUSIC $HOST
