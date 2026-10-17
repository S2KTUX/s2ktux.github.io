// SPDX-License-Identifier: Apache-2.0
// Lanzador experimental propio. Las implementaciones y sus comandos son upstream.
// Un mismo inode ejecutable permite compartir páginas de código entre procesos.
package main

import (
 "context"
 "fmt"
 "os"
 "path/filepath"
 _ "time/tzdata"

 "github.com/spf13/cobra"
 "k8s.io/component-base/cli"
 _ "k8s.io/component-base/logs/json/register"
 _ "k8s.io/component-base/metrics/prometheus/clientgo"
 _ "k8s.io/component-base/metrics/prometheus/version"
 apiserver "k8s.io/kubernetes/cmd/kube-apiserver/app"
 controllers "k8s.io/kubernetes/cmd/kube-controller-manager/app"
 scheduler "k8s.io/kubernetes/cmd/kube-scheduler/app"
 kubelet "k8s.io/kubernetes/cmd/kubelet/app"
)

func main() {
 var command *cobra.Command
 switch filepath.Base(os.Args[0]) {
 case "kube-apiserver": command = apiserver.NewAPIServerCommand()
 case "kube-controller-manager": command = controllers.NewControllerManagerCommand()
 case "kube-scheduler": command = scheduler.NewSchedulerCommand()
 case "kubelet": command = kubelet.NewKubeletCommand(context.Background())
 default:
  fmt.Fprintln(os.Stderr, "Este lanzador solo admite los nombres de componentes Kubernetes conocidos.")
  os.Exit(2)
 }
 os.Exit(cli.Run(command))
}
