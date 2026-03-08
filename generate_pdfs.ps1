$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

$edgeCandidates = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

$edge = $edgeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) {
  throw "Microsoft Edge not found. Install Edge or update edge path in generate_pdfs.ps1."
}

$jobs = @(
  @{
    Html = Join-Path $repoRoot "index.html"
    Pdf = Join-Path $repoRoot "KangJinmo_CV_Main.pdf"
  },
  @{
    Html = Join-Path $repoRoot "projects.html"
    Pdf = Join-Path $repoRoot "KangJinmo_CV_Projects.pdf"
  }
)

foreach ($job in $jobs) {
  $url = "file:///" + ($job.Html -replace "\\", "/")
  & $edge `
    --headless=new `
    --disable-gpu `
    --run-all-compositor-stages-before-draw `
    --virtual-time-budget=12000 `
    --print-to-pdf-no-header `
    "--print-to-pdf=$($job.Pdf)" `
    $url | Out-Null
}

Write-Output "PDF generated:"
Write-Output " - KangJinmo_CV_Main.pdf"
Write-Output " - KangJinmo_CV_Projects.pdf"
