# =============================================================
#  Sign Language Translation -- Single Start Script
#  Usage:  Right-click -> "Run with PowerShell"
#          OR in terminal:  .\start.ps1
#
#  Opens the backend and frontend in SEPARATE terminal windows.
#  Polls port 1234 until Flask is ready before launching Next.js
#  (backend takes ~30-60 s to load TensorFlow + MediaPipe).
# =============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Sign Language Translation System"     -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# -- 1. Check virtual environment exists --
$venvActivate = Join-Path $root ".venv\Scripts\Activate.ps1"
if (-not (Test-Path $venvActivate)) {
    Write-Host "[ERROR] Virtual environment not found at .venv\" -ForegroundColor Red
    Write-Host "        Run the following first:"                 -ForegroundColor Yellow
    Write-Host "          python -m venv .venv"                  -ForegroundColor Yellow
    Write-Host "          .\.venv\Scripts\Activate.ps1"          -ForegroundColor Yellow
    Write-Host "          pip install -r requirements.txt"       -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# -- 2. Open backend in a new PowerShell window --
$serverDir  = Join-Path $root "src\server"
$backendCmd = "Write-Host '[Backend] Activating venv...' -ForegroundColor Cyan; " +
              "& '" + $venvActivate + "'; " +
              "Set-Location '" + $serverDir + "'; " +
              "Write-Host '[Backend] Starting Flask on port 1234...' -ForegroundColor Green; " +
              "python server.py; " +
              "Write-Host '[Backend] Server exited.' -ForegroundColor Red; pause"

Write-Host "[1/2] Opening backend terminal (Flask on port 1234)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# -- 3. Poll port 1234 until Flask is ready --
Write-Host "      Waiting for backend models to load (up to 120 s)..." -ForegroundColor DarkGray

$maxWait = 120
$waited  = 0
$ready   = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waited++
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", 1234)
        $tcp.Close()
        $ready = $true
        break
    } catch {
        # port not open yet, keep waiting
    }
    if ($waited % 10 -eq 0) {
        Write-Host "      ...still waiting ($waited s / $maxWait s)" -ForegroundColor DarkGray
    }
}

if ($ready) {
    Write-Host "      [OK] Backend ready! (took $waited s)" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "      [WARN] Backend did not respond within $maxWait s." -ForegroundColor Yellow
    Write-Host "             Check the backend terminal for errors."      -ForegroundColor Yellow
    Write-Host ""
}

# -- 4. Open frontend in a new PowerShell window --
$clientDir   = Join-Path $root "src\client"
$frontendCmd = "Write-Host '[Frontend] Starting Next.js on port 3000...' -ForegroundColor Cyan; " +
               "Set-Location '" + $clientDir + "'; " +
               "npm run dev; " +
               "Write-Host '[Frontend] Dev server exited.' -ForegroundColor Red; pause"

Write-Host "[2/2] Opening frontend terminal (Next.js on port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

# -- 5. Print URLs and exit launcher --
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Both servers are starting up."         -ForegroundColor White
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
Write-Host "  Landing Page:           http://localhost:3000"           -ForegroundColor White
Write-Host "  Fingerspell and Avatar: http://localhost:3000/recognize" -ForegroundColor White
Write-Host "  Express Mode:           http://localhost:3000/express"   -ForegroundColor White
Write-Host "  Backend API:            http://localhost:1234"           -ForegroundColor White
Write-Host ""
Write-Host "  To stop: close the two terminal windows that opened."    -ForegroundColor DarkGray
Write-Host ""
