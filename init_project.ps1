# Dodo Project Initialization Script
# This script helps you set up your environment for the Dodo framework.

Write-Host "Initializing Dodo Project..." -ForegroundColor Cyan

# 1. Check for Python
if (!(Get-Command "python" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# 2. Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example. Please update your API keys." -ForegroundColor Yellow
    } else {
        New-Item ".env" -ItemType File
        Add-Content ".env" "dodo_ENCRYPTION_KEY=$( [guid]::NewGuid().ToString() )"
        Write-Host "Created new .env file with a generated encryption key." -ForegroundColor Yellow
    }
}

# 3. Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pip install -e .

# 4. Initialize Database
Write-Host "Initializing database migrations..." -ForegroundColor Cyan
alembic upgrade head

Write-Host "`nInitialization Complete!" -ForegroundColor Green
Write-Host "To start the Dodo server, run:" -ForegroundColor Cyan
Write-Host "dodo server" -ForegroundColor White
