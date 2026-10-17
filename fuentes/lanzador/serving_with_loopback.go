/*
Copyright 2018 The Kubernetes Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// S2KTUX private linux/386 build: retain upstream serving/authentication flow,
// but generate the internal loopback certificate with ECDSA P-256. This file
// is a Go build overlay; the downloaded upstream source remains unchanged.
package options

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"fmt"
	"math/big"
	"time"

	"github.com/google/uuid"
	"k8s.io/apiserver/pkg/server"
	"k8s.io/apiserver/pkg/server/dynamiccertificates"
	"k8s.io/client-go/rest"
)

type SecureServingOptionsWithLoopback struct {
	*SecureServingOptions
}

func (o *SecureServingOptions) WithLoopback() *SecureServingOptionsWithLoopback {
	return &SecureServingOptionsWithLoopback{o}
}

func (s *SecureServingOptionsWithLoopback) ApplyTo(secureServingInfo **server.SecureServingInfo, loopbackClientConfig **rest.Config) error {
	if s == nil || s.SecureServingOptions == nil || secureServingInfo == nil {
		return nil
	}
	if err := s.SecureServingOptions.ApplyTo(secureServingInfo); err != nil {
		return err
	}
	if *secureServingInfo == nil || loopbackClientConfig == nil {
		return nil
	}
	maxAge := (3*365 + 1) * 24 * time.Hour
	certPem, keyPem, err := browserLoopbackCertificate(server.LoopbackClientServerNameOverride, maxAge)
	if err != nil {
		return fmt.Errorf("failed to generate self-signed certificate for loopback connection: %v", err)
	}
	certProvider, err := dynamiccertificates.NewStaticSNICertKeyContent("self-signed loopback", certPem, keyPem, server.LoopbackClientServerNameOverride)
	if err != nil {
		return fmt.Errorf("failed to generate self-signed certificate for loopback connection: %v", err)
	}
	(*secureServingInfo).SNICerts = append([]dynamiccertificates.SNICertKeyContentProvider{certProvider}, (*secureServingInfo).SNICerts...)
	secureLoopbackClientConfig, err := (*secureServingInfo).NewLoopbackClientConfig(uuid.New().String(), certPem)
	switch {
	case err != nil && *loopbackClientConfig == nil:
		(*secureServingInfo).SNICerts = (*secureServingInfo).SNICerts[1:]
		return err
	case err != nil && *loopbackClientConfig != nil:
	default:
		*loopbackClientConfig = secureLoopbackClientConfig
	}
	return nil
}

func browserLoopbackCertificate(host string, maxAge time.Duration) ([]byte, []byte, error) {
	caKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil { return nil, nil, err }
	serial := func() (*big.Int, error) {
		n, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
		if err == nil { n.Add(n, big.NewInt(1)) }
		return n, err
	}
	caSerial, err := serial()
	if err != nil { return nil, nil, err }
	validFrom := time.Now().Add(-time.Hour)
	ca := &x509.Certificate{
		SerialNumber: caSerial, Subject: pkix.Name{CommonName: fmt.Sprintf("%s-ca@%d", host, time.Now().Unix())},
		NotBefore: validFrom, NotAfter: validFrom.Add(maxAge),
		KeyUsage: x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		BasicConstraintsValid: true, IsCA: true,
	}
	caDER, err := x509.CreateCertificate(rand.Reader, ca, ca, &caKey.PublicKey, caKey)
	if err != nil { return nil, nil, err }
	ca, err = x509.ParseCertificate(caDER)
	if err != nil { return nil, nil, err }
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil { return nil, nil, err }
	leafSerial, err := serial()
	if err != nil { return nil, nil, err }
	leaf := &x509.Certificate{
		SerialNumber: leafSerial, Subject: pkix.Name{CommonName: fmt.Sprintf("%s@%d", host, time.Now().Unix())},
		NotBefore: validFrom, NotAfter: validFrom.Add(maxAge), DNSNames: []string{host},
		KeyUsage: x509.KeyUsageDigitalSignature, ExtKeyUsage: []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}
	der, err := x509.CreateCertificate(rand.Reader, leaf, ca, &key.PublicKey, caKey)
	if err != nil { return nil, nil, err }
	var chain, private bytes.Buffer
	if err = pem.Encode(&chain, &pem.Block{Type: "CERTIFICATE", Bytes: der}); err != nil { return nil, nil, err }
	if err = pem.Encode(&chain, &pem.Block{Type: "CERTIFICATE", Bytes: caDER}); err != nil { return nil, nil, err }
	keyDER, err := x509.MarshalECPrivateKey(key)
	if err != nil { return nil, nil, err }
	if err = pem.Encode(&private, &pem.Block{Type: "EC PRIVATE KEY", Bytes: keyDER}); err != nil { return nil, nil, err }
	return chain.Bytes(), private.Bytes(), nil
}
