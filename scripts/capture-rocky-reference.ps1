param([string]$Image = 'rockylinux:9')

$ErrorActionPreference = 'Stop'
docker run --rm $Image bash -lc @'
printf "===os-release===\n"
cat /etc/os-release
printf "===arch===\n"
uname -m
printf "===id===\n"
id
printf "===pwd===\n"
pwd
printf "===bash===\n"
bash --version | head -n 1
printf "===missing-file===\n"
LC_ALL=C ls /definitely-missing
printf "===missing-command===\n"
LC_ALL=C definitely-not-a-command
printf "===dnf===\n"
dnf --version | head -n 1
'@
