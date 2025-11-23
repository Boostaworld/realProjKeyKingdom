# Create Next.js in temp folder
Write-Host "Creating Next.js project..." -ForegroundColor Green
npx create-next-app@latest temp-nextjs --typescript --tailwind --app --src-dir --import-alias "@/*"

# Move files
Write-Host "Moving files to current directory..." -ForegroundColor Green
Move-Item -Path "temp-nextjs\src" -Destination "." -Force
Move-Item -Path "temp-nextjs\public" -Destination "." -Force
Move-Item -Path "temp-nextjs\package.json" -Destination "." -Force
Move-Item -Path "temp-nextjs\package-lock.json" -Destination "." -Force
Move-Item -Path "temp-nextjs\tsconfig.json" -Destination "." -Force
Move-Item -Path "temp-nextjs\next.config.ts" -Destination "." -Force
Move-Item -Path "temp-nextjs\tailwind.config.ts" -Destination "." -Force
Move-Item -Path "temp-nextjs\postcss.config.mjs" -Destination "." -Force
Move-Item -Path "temp-nextjs\.eslintrc.json" -Destination "." -Force
Move-Item -Path "temp-nextjs\.gitignore" -Destination ".\.gitignore-nextjs" -Force

# Clean up
Write-Host "Cleaning up..." -ForegroundColor Green
Remove-Item -Path "temp-nextjs" -Recurse -Force

# Install dependencies
Write-Host "Installing additional dependencies..." -ForegroundColor Green
npm install @tanstack/react-query zustand framer-motion lucide-react date-fns clsx tailwind-merge

Write-Host "Done! Your Key-Kingdom project is ready." -ForegroundColor Green