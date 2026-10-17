// Private emulated-cluster experiment. TLS, authentication and real sockets
// stay enabled. Only the API's own loopback client gets a longer handshake
// budget. Copies of its config share the cloned connection pool.
package options

import (
 "net/http"
 "sync"
 "time"
 "k8s.io/client-go/rest"
)

func browserLoopbackHandshakeBudget(config *rest.Config) {
 previous := config.WrapTransport
 var clones sync.Map
 config.WrapTransport = func(base http.RoundTripper) http.RoundTripper {
  result := base
  if transport, ok := base.(*http.Transport); ok {
   if cached, exists := clones.Load(transport); exists {
    result = cached.(*http.Transport)
   } else {
    clone := transport.Clone()
    clone.TLSHandshakeTimeout = 60 * time.Second
    cached, _ := clones.LoadOrStore(transport, clone)
    result = cached.(*http.Transport)
   }
  }
  if previous != nil { return previous(result) }
  return result
 }
}
