# Test Drone Timeout Feature
# Script PowerShell để test nhanh timeout feature

param(
    [Parameter(Mandatory=$true)]
    [string]$OrderId,
    
    [Parameter(Mandatory=$false)]
    [string]$Action = "arrive",
    
    [Parameter(Mandatory=$false)]
    [string]$ServerUrl = "http://localhost:5000"
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  🚁 DRONE TIMEOUT FEATURE TESTER" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Validate Action
if ($Action -notin @("arrive", "confirm", "status")) {
    Write-Host "❌ Invalid action: $Action" -ForegroundColor Red
    Write-Host "   Valid actions: arrive, confirm, status`n" -ForegroundColor Yellow
    exit 1
}

# API endpoints
$endpoints = @{
    arrive = "$ServerUrl/api/drone-sim/arrive/$OrderId"
    confirm = "$ServerUrl/api/drone-sim/confirm/$OrderId"
    status = "$ServerUrl/api/drone-sim/status/$OrderId"
}

$url = $endpoints[$Action]

Write-Host "📋 Test Configuration:" -ForegroundColor Green
Write-Host "   Order ID: $OrderId" -ForegroundColor White
Write-Host "   Action:   $Action" -ForegroundColor White
Write-Host "   URL:      $url`n" -ForegroundColor White

try {
    if ($Action -eq "status") {
        # GET request
        Write-Host "🔍 Fetching delivery status..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    } else {
        # POST request
        Write-Host "📤 Sending $Action command..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json"
    }
    
    Write-Host "`n✅ SUCCESS!`n" -ForegroundColor Green
    
    # Pretty print response
    Write-Host "📦 Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    # Action-specific messages
    switch ($Action) {
        "arrive" {
            Write-Host "`n⏰ Next Steps:" -ForegroundColor Yellow
            Write-Host "   1. Wait 2 seconds for status to change to 'waiting_for_customer'" -ForegroundColor White
            Write-Host "   2. Reload the Order Tracking page" -ForegroundColor White
            Write-Host "   3. You should see the countdown timer! 🎉`n" -ForegroundColor White
            
            Write-Host "   To confirm delivery before timeout:" -ForegroundColor Cyan
            Write-Host "   .\test-timeout.ps1 -OrderId $OrderId -Action confirm`n" -ForegroundColor Gray
        }
        "confirm" {
            Write-Host "`n🎉 Delivery confirmed!" -ForegroundColor Green
            Write-Host "   Order status should be 'delivered'" -ForegroundColor White
            Write-Host "   Countdown timer will disappear`n" -ForegroundColor White
        }
        "status" {
            Write-Host "" # Just spacing
        }
    }
    
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   HTTP Status: $statusCode" -ForegroundColor Red
        
        # Common error messages
        if ($statusCode -eq 404) {
            Write-Host "`n💡 Troubleshooting:" -ForegroundColor Cyan
            Write-Host "   - Check if Order ID is correct" -ForegroundColor White
            Write-Host "   - Order must exist in database`n" -ForegroundColor White
        } elseif ($statusCode -eq 400) {
            Write-Host "`n💡 Troubleshooting:" -ForegroundColor Cyan
            Write-Host "   - Order must be in 'delivering' status for 'arrive' action" -ForegroundColor White
            Write-Host "   - Order must be in 'waiting_for_customer' status for 'confirm' action`n" -ForegroundColor White
        }
    }
    
    Write-Host "🔧 Server running? Check: $ServerUrl/api/health`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "========================================`n" -ForegroundColor Cyan

<#
.SYNOPSIS
    Test script for Drone Delivery Timeout Feature

.DESCRIPTION
    Sends API requests to simulate drone arrival, customer confirmation, or check delivery status

.PARAMETER OrderId
    The Order ID to test (required)

.PARAMETER Action
    Action to perform: arrive, confirm, or status (default: arrive)

.PARAMETER ServerUrl
    Backend server URL (default: http://localhost:5000)

.EXAMPLE
    .\test-timeout.ps1 -OrderId "673094a8eb0e2e85a44e5678"
    Simulate drone arrival

.EXAMPLE
    .\test-timeout.ps1 -OrderId "673094a8eb0e2e85a44e5678" -Action confirm
    Confirm customer received delivery

.EXAMPLE
    .\test-timeout.ps1 -OrderId "673094a8eb0e2e85a44e5678" -Action status
    Check current delivery status

.NOTES
    Make sure backend server is running before using this script!
#>
