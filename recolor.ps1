Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\baps\.gemini\antigravity\brain\c249b342-24f2-47d3-af34-0f168fed226f\.user_uploaded\media_1795683923555_013de89b.jpg"
$destPath = "c:\Users\baps\kilo-kulture\assets\store-map-pin.png"

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Output "Loaded bitmap: $($bmp.Width) x $($bmp.Height)"

# Create a new 32-bit ARGB bitmap for transparency
$outBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Brand colors
# Brand Blue: #0a2a94 -> R: 10, G: 42, B: 148
# Brand Yellow: #ffd500 -> R: 255, G: 213, B: 0
# Brand Dark Blue / Shadow: #06185c -> R: 6, G: 24, B: 92
# Ink: #0b0f2a -> R: 11, G: 15, B: 42

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        $r = $pixel.R
        $g = $pixel.G
        $b = $pixel.B

        # Check for white background
        if ($r -gt 240 -and $g -gt 240 -and $b -gt 240) {
            # Make pure white transparent
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            continue
        }

        # Check for green pin colors (green is dominant: g > r and g > b)
        # Main pin green is around R:40-70, G:140-180, B:60-90 or darker green
        if ($g -gt 100 -and $g -gt ($r + 30) -and $g -gt ($b + 30)) {
            # Bright/medium green -> Brand Blue (#0a2a94)
            # Retain shading based on brightness
            $brightness = $pixel.GetBrightness()
            if ($brightness -gt 0.5) {
                # lighter part of pin -> Royal Blue
                $newColor = [System.Drawing.Color]::FromArgb(255, 20, 60, 185)
            } else {
                # darker shading part of pin -> Deep Navy Blue (#0a2a94)
                $newColor = [System.Drawing.Color]::FromArgb(255, 10, 42, 148)
            }
            $outBmp.SetPixel($x, $y, $newColor)
            continue
        }

        # Check for darker green (store sign, awning dark stripes, pin shadows)
        if ($g -gt 60 -and $g -gt ($r + 15) -and $g -gt ($b + 15)) {
            $newColor = [System.Drawing.Color]::FromArgb(255, 6, 24, 92)
            $outBmp.SetPixel($x, $y, $newColor)
            continue
        }

        # Check for orange path / dot (R > 180, G: 80-150, B < 60)
        # Let's change orange navigation path to bold Brand Blue or bright accent
        if ($r -gt 180 -and $g -lt 160 -and $b -lt 100) {
            # Bold brand blue path
            $newColor = [System.Drawing.Color]::FromArgb(255, 10, 42, 148)
            $outBmp.SetPixel($x, $y, $newColor)
            continue
        }

        # Check for blue dot at destination ($b > $r and $b > $g)
        if ($b -gt 150 -and $b -gt $r -and $b -gt $g) {
            # Destination dot -> Brand Yellow (#ffd500)
            $newColor = [System.Drawing.Color]::FromArgb(255, 255, 213, 0)
            $outBmp.SetPixel($x, $y, $newColor)
            continue
        }

        # For gray grid/roads, keep crisp or slightly sharpen
        if ([Math]::Abs($r - $g) -lt 15 -and [Math]::Abs($g - $b) -lt 15 -and $r -gt 160 -and $r -le 240) {
            # Clean grid lines on yellow background: make them neat subtle dark blue/charcoal with opacity or crisp line
            $newColor = [System.Drawing.Color]::FromArgb(255, 10, 42, 148) # wait, subtle gray or navy?
            # Let's keep the soft street gray/blue
            $newColor = [System.Drawing.Color]::FromArgb(255, 200, 205, 220)
            $outBmp.SetPixel($x, $y, $newColor)
            continue
        }

        # Default keep pixel
        $outBmp.SetPixel($x, $y, $pixel)
    }
}

$outBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$outBmp.Dispose()
Write-Output "Successfully saved recolored transparent PNG to $destPath"
