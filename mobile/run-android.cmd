@echo off
echo ========================================
echo Build e Deploy Android (Wi-Fi + reverse)
echo ========================================
echo.
echo 1. Conectando ADB via Wi-Fi...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" tcpip 5555
timeout /t 2 /nobreak > nul
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" connect 10.0.0.8:5555
timeout /t 1 /nobreak > nul
echo 1b. Desconectando USB para evitar conflito...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" disconnect 2A18295210HA0WB0 2>nul
echo.
echo 2. Buildando APK e instalando...
call pnpm run mobile:dev
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Build/deploy falhou
    pause
    exit /b 1
)
echo.
echo 3. Configurando adb reverse (via Wi-Fi)...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" -s 10.0.0.8:5555 reverse tcp:3000 tcp:3000
echo Reverse OK:
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" -s 10.0.0.8:5555 reverse --list
echo.
echo 4. Abrindo app...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" -s 10.0.0.8:5555 shell am start -n com.salonbooking.app/com.salonbooking.app.MainActivity
echo.
echo ========================================
echo PRONTO! Teste login: teste@teste.com / 123123
echo ========================================
pause
