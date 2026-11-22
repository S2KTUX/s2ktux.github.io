param([Parameter(Mandatory=$true)][ValidateSet('ensayo','produccion')][string]$Destino)
$ErrorActionPreference = 'Stop'
$prefix = "qa/evidencia/ha-$Destino-caida"
function Invoke-HaQa([string]$Id, [string[]]$NodeArgs) {
    & node qa/ha-control.mjs @NodeArgs *> "$prefix-$Id.json"
    if ($LASTEXITCODE -ne 0) { throw "Falló la comprobación $Id. Evidencia en $prefix-$Id.json" }
}
Invoke-HaQa 'vip' @('run','controlplane','qa/ha-confirmar-vip.sh')
Invoke-HaQa 'antes' @('run','worker1','qa/ha-antes-del-fallo.sh')
Invoke-HaQa 'detenido' @('stop-node','controlplane')
try {
    $env:QA_COMMAND_TIMEOUT = '240000'
    Invoke-HaQa 'durante' @('run','worker1','qa/ha-durante-el-fallo.sh')
} finally {
    Invoke-HaQa 'reanudado' @('run-node','controlplane')
}
Invoke-HaQa 'recuperado' @('run','worker1','qa/ha-despues-del-fallo.sh')
& node qa/ha-control.mjs snapshot
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Copy-Item -LiteralPath qa/evidencia/ha-live-20261122.json -Destination "$prefix-consola.json"
