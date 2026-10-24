package options

import (
 "net/http"
 "testing"
 "time"
 "k8s.io/client-go/rest"
)

// Real client-go 1.36 returns a trackedTransport, not *http.Transport.
// This regression deliberately exposes the old helper's silent no-op.
// Apply only to the v1 overlay: its expected failure is diagnostic evidence.
func TestBrowserLoopbackRealClientTransport(t *testing.T) {
 cert, _, err := browserLoopbackCertificate("apiserver-loopback-client", time.Hour)
 if err != nil { t.Fatal(err) }
 config := &rest.Config{Host:"https://127.0.0.1:6443", TLSClientConfig:rest.TLSClientConfig{CAData:cert,ServerName:"apiserver-loopback-client"}}
 browserLoopbackHandshakeBudget(config)
 roundTripper, err := rest.TransportFor(config)
 if err != nil { t.Fatal(err) }
 for depth:=0;depth<8;depth++ {
  if leaf,ok:=roundTripper.(*http.Transport);ok {
   if leaf.TLSHandshakeTimeout!=60*time.Second { t.Fatalf("real TLS budget = %s; old helper was not applied through %T",leaf.TLSHandshakeTimeout,roundTripper) }
   return
  }
  wrapper,ok:=roundTripper.(interface{WrappedRoundTripper() http.RoundTripper})
  if !ok {t.Fatalf("unknown real client transport %T",roundTripper)}
  roundTripper=wrapper.WrappedRoundTripper()
 }
 t.Fatal("transport wrapper depth exceeded")
}
