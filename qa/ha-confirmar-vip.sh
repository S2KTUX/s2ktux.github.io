set -eu
ip -4 -o addr show dev eth0 | grep -F ' 10.77.0.100/24 '
