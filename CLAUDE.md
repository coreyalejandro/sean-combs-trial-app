# Claude Instructions for Sean Combs Trial App

## Project Overview
This is a web application related to the Sean Combs trial. The project structure and specific technologies used should be determined by examining the codebase.

## Development Commands
- Install dependencies: `npm install --legacy-peer-deps`
- Generate Prisma client: `npx prisma generate`
- Create/update database: `npx prisma db push`
- Seed database: `npx prisma db seed`
- Dev server command: `npm run dev`
- Build command: `npm run build`
- Lint command: `npm run lint`
- Start production server: `npm start`

## Database Setup
- Uses SQLite for local development (file: ./dev.db)
- Prisma ORM for database management
- Includes models for TrialDay, Witness, Testimony, and Evidence

## Key Guidelines
- Always run tests after making changes
- Run lint and typecheck commands before considering work complete
- Follow existing code patterns and conventions
- Never commit changes unless explicitly asked
- Use defensive security practices only

## Notes
- This file will be updated as we learn more about the project structure and requirements
- Add specific commands and patterns as they are discovered