// S2KTUX linux/386 experiment. Configure the real client-go transport before
// its trackedTransport ownership wrapper is installed. Keep that wrapper,
// its CA rotation, HTTP/2 defaults, authentication and pool cache untouched.
package transport

import (
 "net/http"
 "time"
)

func browserLoopbackTransportBudget(config *Config, connection *http.Transport) {
 if config.TLS.ServerName!="apiserver-loopback-client" || config.TLS.Insecure ||
  len(config.TLS.CAData)==0 || connection.TLSClientConfig==nil ||
  connection.TLSClientConfig.InsecureSkipVerify || connection.TLSClientConfig.RootCAs==nil {
  return
 }
 connection.TLSHandshakeTimeout=60*time.Second
 // Bound simultaneous loopback handshakes on a single emulated CPU. This
 // does not limit HTTP/2 streams, drop requests or bypass admission/RBAC.
 connection.MaxConnsPerHost=4
}
