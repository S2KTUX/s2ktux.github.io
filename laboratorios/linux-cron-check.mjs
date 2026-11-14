const shellQuote=value=>"'"+value.replaceAll("'","'\\''")+"'";
export function rootCronCheck(schedule,message){
 const code=`import glob, os, re, shlex, subprocess
schedule=${JSON.stringify(schedule.split(' '))}
message=${JSON.stringify(message)}
def matches(text, system=False):
 for line in text.splitlines():
  if not line.strip() or line.lstrip().startswith('#'): continue
  try: fields=shlex.split(line)
  except ValueError: continue
  if fields[:5] != schedule: continue
  if system and fields[5:6] != ['root']: continue
  command=fields[6 if system else 5:]
  if command and command[0] in ('logger','/usr/bin/logger','/bin/logger') and ' '.join(command[1:])==message: return True
 return False
own=subprocess.run(['crontab','-u','root','-l'],capture_output=True,text=True)
files=(p for p in glob.glob('/etc/cron.d/*') if re.fullmatch(r'[A-Za-z0-9_-]+',os.path.basename(p)) and os.path.isfile(p))
assert matches(own.stdout) or any(matches(open(p).read(),True) for p in files)`;
 return 'python3 -c '+shellQuote(code);
}
