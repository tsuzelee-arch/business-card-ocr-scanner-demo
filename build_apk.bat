@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
echo Building web assets...
call npm run build
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%
echo Syncing with Capacitor...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%
echo Entering Android directory...
cd android
echo Cleaning and Building APK...
call gradlew clean assembleDebug
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%
echo SUCCESS!
