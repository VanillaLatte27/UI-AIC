FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for OpenCV and other requirements
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgomp1 \
    libgthread-2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY PASAR/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir flask flask-cors ultralytics opencv-python-headless numpy Pillow

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Expose port
EXPOSE 5000

# Add health check endpoint to the Flask app
RUN echo "#!/bin/bash\npython -c \"import sys; sys.path.append('.'); from flask_app_combined import app; app.run(host='0.0.0.0', port=5000, debug=False)\"" > /app/start.sh && chmod +x /app/start.sh

# Run application
CMD ["python", "flask_app_combined.py"]
