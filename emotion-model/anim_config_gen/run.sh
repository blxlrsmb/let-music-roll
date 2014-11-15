#!/bin/bash -e

[ $# != 2 ] && echo "Usage: $0 <[(time, arousal, valence), ...] file> <output_anim_config>" && exit 1

realpath() {
  [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

if [ `uname` = 'Darwin' ]
then
  project_root=`realpath $script_dir/..`
else
  project_root=$(readlink -f $script_dir/..)
fi

BASE_DIR="$(dirname "$(realpath "$0")")"

bash -c "cd \"$BASE_DIR\" && make"  # g++ get_config.cpp -o get_config &&
cat $1 | "$BASE_DIR/get_config" | python2 "$BASE_DIR/stdin2json.py" > "$2"
