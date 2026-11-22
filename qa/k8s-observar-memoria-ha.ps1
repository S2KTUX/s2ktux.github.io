$ErrorActionPreference = 'Stop'
$taskFile = 'qa/evidencia/k8s-medicion-real-20261121.json'
$outputFile = 'qa/evidencia/k8s-ha-memoria-en-preparacion-20261121.jsonl'
$deadline = (Get-Date).AddMinutes(45)
while ((Get-Date) -lt $deadline) {
    $data = Get-Content -LiteralPath $taskFile -Raw | ConvertFrom-Json
    $ha = @($data.rows | Where-Object { $_.profile -eq 'ha' }) | Select-Object -Last 1
    if ($ha -and $ha.finished) { break }
    if ($ha) {
        $inventory = @(Get-CimInstance Win32_Process)
        $runner = $inventory | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*qa/k8s-medir-mejoras-reales.mjs*' } | Select-Object -First 1
        if (-not $runner) { break }
        $descendants = [System.Collections.Generic.HashSet[int]]::new()
        [void]$descendants.Add([int]$runner.ProcessId)
        do {
            $added = $false
            foreach ($process in $inventory) {
                if ($descendants.Contains([int]$process.ParentProcessId) -and $descendants.Add([int]$process.ProcessId)) { $added = $true }
            }
        } while ($added)
        $browserIds = @($inventory | Where-Object { $_.Name -in @('chrome.exe','chrome-headless-shell.exe','headless_shell.exe') -and $descendants.Contains([int]$_.ProcessId) } | ForEach-Object { [int]$_.ProcessId })
        $privateBytes = 0
        if ($browserIds.Count) { $privateBytes = (Get-Process -Id $browserIds -ErrorAction SilentlyContinue | Measure-Object PrivateMemorySize64 -Sum).Sum }
        [ordered]@{ at=(Get-Date).ToUniversalTime().ToString('o'); privateBytes=$privateBytes; processes=$browserIds.Count; method='Chrome descendiente del runner; suma PrivateMemorySize64 durante preparación'; status=$ha.phases[-1].status } | ConvertTo-Json -Compress | Add-Content -LiteralPath $outputFile
    }
    Start-Sleep -Seconds 30
}
