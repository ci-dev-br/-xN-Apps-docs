$logFile = "./relatorio-noite.log"
"--- Início do monitoramento: $(Get-Date) ---" | Out-File -FilePath $logFile -Append

while ($true) {
    $startTime = Get-Date
    "[$startTime] Aplicação iniciada." | Out-File -FilePath $logFile -Append
    
    # Executa o Node diretamente, aumentando o limite de heap para evitar a queda imediata
    node --max-old-space-size=512 dist/main.js *>&1 | Tee-Object -FilePath $logFile -Append
    
    $endTime = Get-Date
    $uptime = $endTime - $startTime
    
    "[$endTime] ALERTA: A aplicação caiu. Permaneceu ativa por: $($uptime.ToString()). Reiniciando em 5 segundos..." | Out-File -FilePath $logFile -Append
    
    Start-Sleep -Seconds 5
}