@echo off
set "PATH=%PATH%;C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\nodejs;C:\Users\USER\AppData\Roaming\npm;C:\Program Files\Git\cmd;D:\MongoDB\Server\9.0\bin"
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -NoProfile %*
