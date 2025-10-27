# PowerShell script to set up placeholder icons
# This creates simple colored PNG files as placeholders

Write-Host "Setting up placeholder icons..." -ForegroundColor Green

# Create public/icons directory if it doesn't exist
$iconsDir = "public\icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null
}

Write-Host ""
Write-Host "Icon directories created." -ForegroundColor Yellow
Write-Host ""
Write-Host "To generate icons:" -ForegroundColor Cyan
Write-Host "1. Open scripts/generate-icons.html in your browser" -ForegroundColor White
Write-Host "2. Click the download buttons to save each icon" -ForegroundColor White
Write-Host "3. Move the downloaded icons to public/icons/" -ForegroundColor White
Write-Host ""
Write-Host "After generating icons, copy them to dist/icons/ before loading the extension." -ForegroundColor Yellow

