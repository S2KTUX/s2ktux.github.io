package transport

import (
 "crypto/ecdsa"
 "crypto/elliptic"
 "crypto/rand"
 "crypto/tls"
 "crypto/x509"
 "crypto/x509/pkix"
 "encoding/pem"
 "fmt"
 "io"
 "math/big"
 "net/http"
 "net/http/httptest"
 "sync"
 "sync/atomic"
 "testing"
 "time"
)

func browserTLSCertificate(t *testing.T) ([]byte,tls.Certificate) {
 t.Helper()
 key,err:=ecdsa.GenerateKey(elliptic.P256(),rand.Reader);if err!=nil {t.Fatal(err)}
 serial,err:=rand.Int(rand.Reader,new(big.Int).Lsh(big.NewInt(1),120));if err!=nil {t.Fatal(err)}
 cert:=&x509.Certificate{SerialNumber:serial,Subject:pkix.Name{CommonName:"apiserver-loopback-client"},DNSNames:[]string{"apiserver-loopback-client"},NotBefore:time.Now().Add(-time.Minute),NotAfter:time.Now().Add(time.Hour),IsCA:true,BasicConstraintsValid:true,KeyUsage:x509.KeyUsageCertSign|x509.KeyUsageDigitalSignature,ExtKeyUsage:[]x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth}}
 der,err:=x509.CreateCertificate(rand.Reader,cert,cert,&key.PublicKey,key);if err!=nil {t.Fatal(err)}
 certPEM:=pem.EncodeToMemory(&pem.Block{Type:"CERTIFICATE",Bytes:der})
 keyDER,err:=x509.MarshalECPrivateKey(key);if err!=nil {t.Fatal(err)}
 pair,err:=tls.X509KeyPair(certPEM,pem.EncodeToMemory(&pem.Block{Type:"EC PRIVATE KEY",Bytes:keyDER}));if err!=nil {t.Fatal(err)}
 return certPEM,pair
}

func browserTransportLeaf(t *testing.T,roundTripper http.RoundTripper) *http.Transport {
 t.Helper()
 for depth:=0;depth<8;depth++ {
  if leaf,ok:=roundTripper.(*http.Transport);ok {return leaf}
  wrapper,ok:=roundTripper.(interface{WrappedRoundTripper() http.RoundTripper});if !ok {t.Fatalf("unrecognized transport %T",roundTripper)}
  roundTripper=wrapper.WrappedRoundTripper()
 }
 t.Fatal("too many wrappers");return nil
}

func TestBrowserTransportRealCacheAndTLS(t *testing.T) {
 ca,pair:=browserTLSCertificate(t)
 config:=&Config{TLS:TLSConfig{CAData:ca,ServerName:"apiserver-loopback-client"},BearerToken:"qa-loopback-test"}
 roundTripper,err:=New(config);if err!=nil {t.Fatal(err)}
 leaf:=browserTransportLeaf(t,roundTripper)
 if leaf.TLSHandshakeTimeout!=60*time.Second || leaf.MaxConnsPerHost!=4 {t.Fatalf("real wrapped budget: %s / %d",leaf.TLSHandshakeTimeout,leaf.MaxConnsPerHost)}
 if leaf.TLSClientConfig.InsecureSkipVerify || leaf.TLSClientConfig.RootCAs==nil || leaf.TLSClientConfig.MinVersion!=tls.VersionTLS12 {t.Fatal("TLS weakened")}
 again,err:=New(config);if err!=nil {t.Fatal(err)}
 if browserTransportLeaf(t,again)!=leaf {t.Fatal("pool is not shared")}
 var active,peak,received atomic.Int32
 server:=httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){
  if r.TLS==nil || r.TLS.ServerName!="apiserver-loopback-client" || r.Header.Get("Authorization")!="Bearer qa-loopback-test" {w.WriteHeader(http.StatusForbidden);return}
  count:=active.Add(1);defer active.Add(-1)
  for old:=peak.Load();count>old;old=peak.Load(){if peak.CompareAndSwap(old,count){break}}
  time.Sleep(10*time.Millisecond);received.Add(1);fmt.Fprint(w,"authenticated")
 }))
 // HTTP/1.1 deliberately makes the connection bound observable. The
 // transport's actual HTTP/2 defaults are not disabled by the patch.
 server.TLS=&tls.Config{Certificates:[]tls.Certificate{pair},MinVersion:tls.VersionTLS12}
 server.StartTLS();defer server.Close();defer leaf.CloseIdleConnections()
 client:=&http.Client{Transport:roundTripper,Timeout:10*time.Second}
 var pending sync.WaitGroup
 for i:=0;i<40;i++ {pending.Add(1);go func(){defer pending.Done();response,err:=client.Get(server.URL);if err!=nil {t.Error(err);return};defer response.Body.Close();body,err:=io.ReadAll(response.Body);if err!=nil || response.StatusCode!=200 || string(body)!="authenticated" {t.Errorf("invalid response %d %q %v",response.StatusCode,body,err)}}()}
 pending.Wait()
 if received.Load()!=40 || peak.Load()>4 {t.Fatalf("received %d, peak %d",received.Load(),peak.Load())}
 unauthorized:=*config;unauthorized.BearerToken="wrong-token"
 unauthorizedRT,err:=New(&unauthorized);if err!=nil {t.Fatal(err)}
 denied,err:=(&http.Client{Transport:unauthorizedRT,Timeout:5*time.Second}).Get(server.URL)
 if err!=nil {t.Fatal(err)}
 denied.Body.Close();if denied.StatusCode!=http.StatusForbidden {t.Fatal("authentication bypassed")}
 h2:=httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){
  if r.ProtoMajor!=2 || r.TLS==nil || r.Header.Get("Authorization")!="Bearer qa-loopback-test" {w.WriteHeader(http.StatusForbidden);return}
  fmt.Fprint(w,"http2-kept")
 }))
 h2.EnableHTTP2=true;h2.TLS=&tls.Config{Certificates:[]tls.Certificate{pair},MinVersion:tls.VersionTLS12}
 h2.StartTLS();defer h2.Close()
 response,err:=client.Get(h2.URL);if err!=nil {t.Fatal(err)}
 body,err:=io.ReadAll(response.Body);response.Body.Close()
 if err!=nil || response.StatusCode!=200 || string(body)!="http2-kept" {t.Fatalf("HTTP/2 not preserved: %d %q %v",response.StatusCode,body,err)}
 for _,mutate:=range []func(*Config){func(c *Config){c.TLS.ServerName="not-the-server"},func(c *Config){wrong,_:=browserTLSCertificate(t);c.TLS.CAData=wrong}} {
  bad:=*config;bad.TLS=config.TLS;mutate(&bad)
  badRT,err:=New(&bad);if err!=nil {t.Fatal(err)}
  badClient:=&http.Client{Transport:badRT,Timeout:5*time.Second}
  if response,err:=badClient.Get(server.URL);err==nil {response.Body.Close();t.Fatal("invalid CA or hostname accepted")}
  browserTransportLeaf(t,badRT).CloseIdleConnections()
 }
 ordinary:=&Config{TLS:TLSConfig{CAData:ca,ServerName:"ordinary-client"}}
 ordinaryRT,err:=New(ordinary);if err!=nil {t.Fatal(err)}
 ordinaryLeaf:=browserTransportLeaf(t,ordinaryRT)
 if ordinaryLeaf.TLSHandshakeTimeout!=10*time.Second || ordinaryLeaf.MaxConnsPerHost!=0 {t.Fatal("ordinary client changed")}
 ordinaryLeaf.CloseIdleConnections()
}
