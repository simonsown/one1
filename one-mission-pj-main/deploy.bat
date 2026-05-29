@echo off
set VERCEL_TOKEN=%~1
npx vercel --prod --yes
