while ($true) {
	    npm run start:debug
	        Write-Host "A aplicação caiu. Reiniciando em 3 segundos..." -ForegroundColor Red
		    Start-Sleep -Seconds 3
}
