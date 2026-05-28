# Rename App Script for Capacitor
# Usage: .\rename_app.ps1 "New App Name"

param (
    [Parameter(Mandatory=$true)]
    [string]$NewName
)

$RootPath = Get-Location
$PackageJson = Join-Path $RootPath "package.json"
$CapConfig = Join-Path $RootPath "capacitor.config.json"
$IndexHtml = Join-Path $RootPath "index.html"
$StringsXml = Join-Path $RootPath "android\app\src\main\res\values\strings.xml"

Write-Host "Renaming app to: $NewName" -ForegroundColor Cyan

# 1. Update package.json
if (Test-Path $PackageJson) {
    Write-Host "Updating package.json..."
    $json = Get-Content $PackageJson | ConvertFrom-Json
    $json.name = $NewName
    $json | ConvertTo-Json -Depth 10 | Set-Content $PackageJson
}

# 2. Update capacitor.config.json
if (Test-Path $CapConfig) {
    Write-Host "Updating capacitor.config.json..."
    $json = Get-Content $CapConfig | ConvertFrom-Json
    $json.appName = $NewName
    $json | ConvertTo-Json -Depth 10 | Set-Content $CapConfig
}

# 3. Update index.html
if (Test-Path $IndexHtml) {
    Write-Host "Updating index.html..."
    $content = Get-Content $IndexHtml
    $content = $content -replace '<title>.*</title>', "<title>$NewName</title>"
    $content | Set-Content $IndexHtml
}

# 4. Update strings.xml (Android)
if (Test-Path $StringsXml) {
    Write-Host "Updating Android strings.xml..."
    $content = Get-Content $StringsXml
    $content = $content -replace '<string name="app_name">.*</string>', "<string name="app_name">$NewName</string>"
    $content = $content -replace '<string name="title_activity_main">.*</string>', "<string name="title_activity_main">$NewName</string>"
    $content | Set-Content $StringsXml
}

Write-Host "Success! Name updated in all configuration files." -ForegroundColor Green
Write-Host "To update icons, ensure assets/icon.png exists and run:" -ForegroundColor Yellow
Write-Host "npx capacitor-assets generate --android"
