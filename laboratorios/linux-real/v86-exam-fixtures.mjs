// Recursos reales dentro de las VM privadas del examen. Sin conexiones externas.
export const examContainerfile='FROM localhost/curso-busybox:1\nLABEL curso=examen\nCMD ["/bin/busybox", "sleep", "86400"]\n';
export const examDnsPython=`import socket,struct,threading,ipaddress
RECORDS={'servera.example.com':'10.42.0.20','serverb.example.com':'10.42.0.11','nodo1':'10.42.0.20','nodo2':'10.42.0.11','ntp.lab.local':'10.42.0.11','gateway.lab.local':'10.43.0.2'}
NET=ipaddress.ip_network('10.42.0.0/24')
def reply(data):
 if len(data)<12 or len(data)>4096: return None
 ident,flags,qd,an,ns,ar=struct.unpack('!6H',data[:12])
 if flags&0x8000 or flags&0x7800 or qd!=1: return None
 pos=12; labels=[]
 while pos<len(data):
  n=data[pos];pos+=1
  if n==0: break
  if n>63 or pos+n>len(data): return None
  labels.append(data[pos:pos+n].decode('ascii').lower());pos+=n
  if pos>267: return None
 else: return None
 if pos+4>len(data): return None
 typ,cls=struct.unpack('!2H',data[pos:pos+4]);question=data[12:pos+4]
 name='.'.join(labels);address=RECORDS.get(name);rcode=0 if address else 3
 answer=b''
 if address and typ==1 and cls==1: answer=b'\\xc0\\x0c'+struct.pack('!HHIH',1,1,60,4)+socket.inet_aton(address)
 return struct.pack('!6H',ident,0x8400|(flags&0x0100)|rcode,1,bool(answer),0,0)+question+answer
def allowed(address):
 ip=ipaddress.ip_address(address);return ip.is_loopback or ip in NET
def receive(sock,n):
 data=b''
 while len(data)<n:
  chunk=sock.recv(n-len(data))
  if not chunk: raise ValueError('EOF')
  data+=chunk
 return data
def tcp_client(conn,address):
 with conn:
  if not allowed(address[0]): return
  conn.settimeout(3)
  try:
   size=struct.unpack('!H',receive(conn,2))[0]
   if size>4096: return
   answer=reply(receive(conn,size))
   if answer: conn.sendall(struct.pack('!H',len(answer))+answer)
  except (ValueError,OSError,UnicodeError): pass
def tcp_loop():
 server=socket.socket();server.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);server.bind(('0.0.0.0',53));server.listen(8)
 while True:
  conn,address=server.accept();threading.Thread(target=tcp_client,args=(conn,address),daemon=True).start()
threading.Thread(target=tcp_loop,daemon=True).start()
udp=socket.socket(socket.AF_INET,socket.SOCK_DGRAM);udp.bind(('0.0.0.0',53))
while True:
 data,address=udp.recvfrom(4097)
 if not allowed(address[0]): continue
 try:
  answer=reply(data)
  if answer: udp.sendto(answer,address)
 except (ValueError,OSError,UnicodeError): pass
`;
export const examGatewayScript=`#!/bin/sh
set -eu
ip netns list | grep -q '^exam-servicios ' || ip netns add exam-servicios
if ! ip link show exam-gw >/dev/null 2>&1; then
 ip link add exam-gw type veth peer name exam-peer
 ip link set exam-peer netns exam-servicios
fi
ip addr replace 10.43.0.1/24 dev exam-gw
ip link set exam-gw up
ip netns exec exam-servicios ip link set lo up
ip netns exec exam-servicios ip addr replace 10.43.0.2/24 dev exam-peer
ip netns exec exam-servicios ip link set exam-peer up
ip netns exec exam-servicios ip route replace default via 10.43.0.1
sysctl -w net.ipv4.ip_forward=1
`;
export const examNode2Information='La cuenta hermes está preparada con contraseña cambiame1. El disco adicional tiene 2 GiB; su primera partición contiene seedvg/reducible y debe conservarse. El espacio libre restante se utilizará para las preguntas 15 y 16. Los nombres de los discos pueden cambiar al reiniciar; no modifiques el disco del sistema.';
