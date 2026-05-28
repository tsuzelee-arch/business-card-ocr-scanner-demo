@echo off
setlocal enabledelayedexpansion

set NODE_DIR=C:\Program Files\nodejs
set SDK_DIR=%LOCALAPPDATA%\Android\Sdk
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr

if exist "%NODE_DIR%\node.exe" (
    set "PATH=%NODE_DIR%;%PATH%"
    echo Using Node from %NODE_DIR%
)

if exist "%SDK_DIR%\platform-tools" (
    set "ANDROID_HOME=%SDK_DIR%"
    set "ANDROID_SDK_ROOT=%SDK_DIR%"
    set "PATH=%SDK_DIR%\platform-tools;%SDK_DIR%\tools;%SDK_DIR%\tools\bin;%PATH%"
    echo Using SDK from %SDK_DIR%
)

echo STARTING BIZ SCANNER BUILD
if exist dist rd /s /q dist

call npm run build || (echo Build failed & exit /b 1)
node node_modules\@capacitor\cli\bin\capacitor sync android || (echo Sync failed & exit /b 1)

cd android
call gradlew.bat assembleDebug --no-daemon || (cd .. & echo Gradle failed & exit /b 1)
cd ..

set APK=android\app\build\outputs\apk\debug\app-debug.apk
if exist "%APK%" (
  echo SUCCESS APK ready at %CD%\%APK%
) else (
  echo BUILD FAILED APK not found.
  exit /b 1
)
