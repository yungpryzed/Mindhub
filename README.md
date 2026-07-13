🧠 MindHub
A clean, dark-mode "Second Brain" dashboard built to centralize movies, music, notes, and to-dos into one interconnected personal hub.

Instead of using heavy frontend frameworks, I built this to deeply understand how data flows from the database to the DOM using pure JavaScript.

✨ Key Features
Dual View System: Instantly switch between a "Folder" view and a Netflix-style "Dashboard" view.
External APIs Integration: Fetched and merged data from TMDB (movies) and iTunes (music) into unified backend DTOs.
Global Fuzzy Search: A Ctrl+K shortcut to instantly filter any content across the app.
Dynamic Rating System: Visual rating badges driven by database data.

🛠️ Tech Stack & Architecture
Backend: Node.js, Express.js (Strict Controller/Service layer separation)
Database: PostgreSQL (Used JSONB payloads for flexible, polymorphic data storage)
Frontend: Vanilla JS (ES6 Modules) & CSS Grid/Flexbox. Zero frameworks.
Auth: Stateless JWT authentication.

🚀 Quick Start
git clone https://github.com/yungpryzed/Mindhub.gitcd Mindhubnpm installpsql -U postgres -c "CREATE DATABASE mindhub;"# Add your DB credentials and JWT_SECRET to a .env filenpm run dev

Built from scratch to practice real-world backend patterns and clean code.