package options

import (
 "crypto/tls"
 "crypto/x509"
 "net/http"
 "sync"
 "testing"
 "time"
 "k8s.io/client-go/rest"
)

func TestBrowserLoopbackHandshakeBudget(t *testing.T) {
 roots := x509.NewCertPool()
 base := &http.Transport{TLSHandshakeTimeout:10*time.Second,TLSClientConfig:&tls.Config{ServerName:"apiserver-loopback-client",RootCAs:roots,MinVersion:tls.VersionTLS12}}
 config := &rest.Config{}
 browserLoopbackHandshakeBudget(config)
 clone := config.WrapTransport(base).(*http.Transport)
 if clone==base || base.TLSHandshakeTimeout!=10*time.Second || clone.TLSHandshakeTimeout!=60*time.Second { t.Fatal("budget mutated shared/default transport") }
 if clone.TLSClientConfig.InsecureSkipVerify || clone.TLSClientConfig.RootCAs!=roots || clone.TLSClientConfig.ServerName!=base.TLSClientConfig.ServerName || clone.TLSClientConfig.MinVersion!=tls.VersionTLS12 { t.Fatal("TLS verification or identity changed") }
 if config.WrapTransport(base)!=clone { t.Fatal("connection pool not reused") }
 var wait sync.WaitGroup
 for i:=0;i<50;i++ { wait.Add(1);go func(){defer wait.Done();if config.WrapTransport(base)!=clone {t.Error("concurrent config copies lost pool")}}() }
 wait.Wait()
 seen := false
 wrapped := &rest.Config{WrapTransport:func(input http.RoundTripper) http.RoundTripper {seen=input.(*http.Transport).TLSHandshakeTimeout==60*time.Second;return input}}
 browserLoopbackHandshakeBudget(wrapped)
 wrapped.WrapTransport(base)
 if !seen { t.Fatal("existing wrapper discarded") }
 other := http.RoundTripper(&roundTripperStub{})
 if config.WrapTransport(other)!=other { t.Fatal("custom transport replaced") }
}
type roundTripperStub struct{}
func (*roundTripperStub) RoundTrip(*http.Request)(*http.Response,error){return nil,nil}
