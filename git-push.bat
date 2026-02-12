@echo off
cd /d C:\dev\mistandmatter

echo Initializing Git repository...
git init

echo Adding remote repository...
git remote add origin https://github.com/mistnmatter-vrmg/MnM.git

echo Adding all files...
git add .

echo Committing files...
git commit -m "Initial commit - Mist and Matter website"

echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo Done!
pause
