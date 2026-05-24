@echo off
echo Starting RepoMind...

:: Start the backend in a new command prompt window
start cmd /k ".\env\Scripts\activate && uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload --reload-dir backend"

:: Start the frontend in another new command prompt window
start cmd /k "cd frontend && npm run dev"

echo Both backend and frontend are starting up!
echo The frontend will be available at http://localhost:5173
echo The backend is running on http://127.0.0.1:8000
