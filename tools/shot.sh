#!/bin/sh
# uso: shot.sh <ruta> <ancho> <alto> <salida.png>
E="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
"$E" --headless=new --disable-gpu --hide-scrollbars --window-size=$2,$3 --virtual-time-budget=4000 --screenshot="C:/Users/needf/mpgroup/tools/shots/$4" "http://localhost:8090$1" 2>/dev/null
