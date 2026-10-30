
$ErrorActionPreference = "Continue"

# Get the Git repository root
$repo = git rev-parse --show-toplevel

if ($LASTEXITCODE -ne 0 -or -not $repo) {
    Write-Error "Not a Git repository."
    exit 1
}

Set-Location $repo

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "       ALGOTRACK AUTO GIT PUSH        " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Repository: $repo" -ForegroundColor Green
Write-Host "Interval: 1 minute" -ForegroundColor Yellow

while ($true) {

    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] Checking changes..." -ForegroundColor Cyan

    # Stage changes
    git add -A

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to stage changes." -ForegroundColor Red
    }
    else {

        # Get changed file names
        $changedFiles = @(git diff --cached --name-only)

        if ($changedFiles.Count -gt 0) {

            # Generate commit message using changed file names
            $fileNames = $changedFiles -join ", "

            if ($fileNames.Length -gt 65) {
                $fileNames = $fileNames.Substring(0, 62) + "..."
            }

            $message = "chore: update $fileNames"

            Write-Host "`nChanged files:" -ForegroundColor Yellow

            foreach ($file in $changedFiles) {
                Write-Host "  + $file" -ForegroundColor Gray
            }

            Write-Host "`nCommit: $message" -ForegroundColor Yellow

            # Commit changes
            git commit -m $message

            if ($LASTEXITCODE -eq 0) {

                Write-Host "Commit successful." -ForegroundColor Green

                # Push current branch
                git push origin HEAD

                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
                }
                else {
                    Write-Host "Push failed. Commit remains local." -ForegroundColor Red
                }

            }
            else {
                Write-Host "Commit failed. Check Git output." -ForegroundColor Red
            }

        }
        else {
            Write-Host "No changes detected." -ForegroundColor Gray
        }
    }

    Write-Host "`nNext check in 60 seconds..." -ForegroundColor DarkCyan

    Start-Sleep -Seconds 60
}
