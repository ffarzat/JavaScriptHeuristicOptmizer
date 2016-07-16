#!/bin/bash

# Function to be backgrounded
track() {
  mpirun -n 5 -host r2i4n16.ib0.smc-default.americas.sgi.com -x PBS_GET_IBWINS=1 -x PATH=$PATH:node=/mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node:npm=/mnt/scratch/user8/nodev4/node-v4.4.7/out/bin/npm /mnt/scratch/user8/nodev4/node-v4.4.7/out/Release/node --expose-gc --max-old-space-size=102400 build/src/MPI/client.js /mnt/scratch/user8/LibsTemp/10/uuid 10000
  #sleep $1
  printf "\nFinished: %d\n" "$1"
}

start=$(date '+%s')

#rand3="$(jot -s\  -r 3 5 10)"

# If you don't have `jot` (*BSD/OSX), substitute your own numbers here.
rand3="1 2 3"

echo "Random numbers: $rand3"

# Make an associative array in which you'll record pids.
declare -A pids

# Background an instance of the track() function for each number, record the pid.
for n in $rand3; do
  track $n &
  pid=$!
  echo "Backgrounded: $n (pid=$pid)"
  pids[$pid]=$n
done

# Watch your stable of backgrounded processes.
# If a pid goes away, remove it from the array.
while [ -n "${pids[*]}" ]; do
  sleep 1
  for pid in "${!pids[@]}"; do
    if ! ps "$pid" >/dev/null; then
      unset pids[$pid]
      echo "unset: $pid"
    fi
  done
  if [ -z "${!pids[*]}" ]; then
    break
  fi
  printf "\rStill waiting for: %s ... " "${pids[*]}"
done

printf "\r%-25s \n" "Done."
printf "Total runtime: %d seconds\n" "$((`date '+%s'` - $start))"