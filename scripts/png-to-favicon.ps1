# Regenerate app/favicon.ico from app/icon.png (32x32) so the tab icon gets
# the brand cream background too.
Add-Type -AssemblyName System.Drawing

$png = "C:\Users\USER\Desktop\sadikticket\app\icon.png"
$ico = "C:\Users\USER\Desktop\sadikticket\app\favicon.ico"

$src = [System.Drawing.Bitmap]::FromFile($png)
$small = New-Object System.Drawing.Bitmap(32, 32)
$g = [System.Drawing.Graphics]::FromImage($small)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, 32, 32)
$g.Dispose()
$src.Dispose()

$hicon = $small.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hicon)
$fs = [System.IO.File]::Create($ico)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$small.Dispose()
Write-Output "saved $ico"
