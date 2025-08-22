@echo off
echo Starting Flask AI Detection App...
echo.
echo This will start the AI detection service on port 5000
echo Make sure you have Python and required packages installed
echo.
cd "C:\Users\user\Downloads\UI-AIC\AI\PASAR"
echo Current directory: %CD%
echo.
echo Installing required packages...
pip install flask flask-cors ultralytics opencv-python numpy
echo.
echo Starting Flask app...
python flask_app.py
pause



