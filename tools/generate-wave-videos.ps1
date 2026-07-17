$ErrorActionPreference = "Stop"

$mediaDirectory = Join-Path $PSScriptRoot "..\public\media"
New-Item -ItemType Directory -Path $mediaDirectory -Force | Out-Null

function New-WaveVideo {
  param(
    [string]$Name,
    [string]$Background,
    [int]$BackgroundRed,
    [int]$BackgroundGreen,
    [int]$BackgroundBlue,
    [int]$DotRed,
    [int]$DotGreen,
    [int]$DotBlue,
    [int]$AccentRed,
    [int]$AccentGreen,
    [int]$AccentBlue
  )

  $dot = "lte(hypot(mod(X\,12)-6\,mod(Y-(sin(X/W*18+T*1.35)*34+cos(X/W*8-T*.7)*19)\,12)-6)\,1.15+Y/H*1.05)"
  $accent = "gt(sin(X*.11+Y*.075+T*1.4)\,.97)"
  $red = "if($dot\,if($accent\,$AccentRed\,$DotRed)\,$BackgroundRed)"
  $green = "if($dot\,if($accent\,$AccentGreen\,$DotGreen)\,$BackgroundGreen)"
  $blue = "if($dot\,if($accent\,$AccentBlue\,$DotBlue)\,$BackgroundBlue)"
  $filter = "color=c=${Background}:s=960x540:r=20:d=6,geq=r='$red':g='$green':b='$blue'"
  $videoPath = Join-Path $mediaDirectory "$Name.mp4"
  $posterPath = Join-Path $mediaDirectory "$Name.jpg"

  & ffmpeg -hide_banner -loglevel error -y -f lavfi -i $filter -an -c:v libx264 -profile:v main -level 3.1 -preset slow -pix_fmt yuv420p -movflags +faststart -crf 33 $videoPath
  & ffmpeg -hide_banner -loglevel error -y -ss 2 -i $videoPath -frames:v 1 -q:v 3 $posterPath
}

New-WaveVideo -Name "reward-wave-dark" -Background "#04130d" -BackgroundRed 4 -BackgroundGreen 19 -BackgroundBlue 13 -DotRed 228 -DotGreen 235 -DotBlue 231 -AccentRed 105 -AccentGreen 218 -AccentBlue 161
New-WaveVideo -Name "reward-wave-light" -Background "#faf7ee" -BackgroundRed 250 -BackgroundGreen 247 -BackgroundBlue 238 -DotRed 7 -DotGreen 20 -DotBlue 13 -AccentRed 20 -AccentGreen 73 -AccentBlue 48
