package options

import (
	"crypto/ecdsa"
	"crypto/tls"
	"crypto/x509"
	"encoding/pem"
	"testing"
	"time"
)

func TestBrowserLoopbackCertificate(t *testing.T) {
	const host = "apiserver-loopback-client"
	chain, private, err := browserLoopbackCertificate(host, 3*365*24*time.Hour)
	if err != nil { t.Fatal(err) }
	pair, err := tls.X509KeyPair(chain, private)
	if err != nil { t.Fatal(err) }
	if _, ok := pair.PrivateKey.(*ecdsa.PrivateKey); !ok { t.Fatal("not ECDSA") }
	leaf, err := x509.ParseCertificate(pair.Certificate[0])
	if err != nil { t.Fatal(err) }
	root, err := x509.ParseCertificate(pair.Certificate[1])
	if err != nil { t.Fatal(err) }
	pool := x509.NewCertPool(); pool.AddCert(root)
	if _, err = leaf.Verify(x509.VerifyOptions{DNSName: host, Roots: pool}); err != nil { t.Fatal(err) }
	if _, err = leaf.Verify(x509.VerifyOptions{DNSName: "not-the-loopback", Roots: pool}); err == nil { t.Fatal("accepted wrong hostname") }
	if _, err = leaf.Verify(x509.VerifyOptions{DNSName: host, Roots: x509.NewCertPool()}); err == nil { t.Fatal("accepted untrusted CA") }
	if _, err = leaf.Verify(x509.VerifyOptions{DNSName: host, Roots: pool, CurrentTime: leaf.NotAfter.Add(time.Second)}); err == nil { t.Fatal("accepted expired cert") }
	block, _ := pem.Decode(private)
	key, err := x509.ParseECPrivateKey(block.Bytes)
	if err != nil || key.Curve.Params().BitSize != 256 { t.Fatal("not P-256") }
	next, _, err := browserLoopbackCertificate(host, 3*365*24*time.Hour)
	if err != nil || string(next) == string(chain) { t.Fatal("certificate is not fresh") }
}
