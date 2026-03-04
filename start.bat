@echo off
title 🚀 MERN Development Server

start "MERN App" cmd /k "npm run dev"

timeout /t 7 > nul

start "" "http://localhost:5173"