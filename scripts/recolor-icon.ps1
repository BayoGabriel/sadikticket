# Recolour app/icon.png's white background to the brand cream (#FFFEDD) via a
# multiply blend — keeps anti-aliased edges smooth and tints colours like ink
# on cream paper.
Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\USER\Desktop\sadikticket\app\icon.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height
Write-Output "source: ${w}x${h}"

$out = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$creamR = 255; $creamG = 254; $creamB = 221

for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $p = $src.GetPixel($x, $y)
    $r = [int]($p.R * $creamR / 255)
    $g = [int]($p.G * $creamG / 255)
    $b = [int]($p.B * $creamB / 255)
    $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($p.A, $r, $g, $b))
  }
}

$src.Dispose()
$out.Save($srcPath, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose()
Write-Output "saved $srcPath"
