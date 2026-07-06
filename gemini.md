# MindHub: Global System Instructions

## 1. Project Context
MindHub is a Monolithic Asset & Media Dashboard. All architectural, design, and implementation decisions must support a high-performance, maintainable, and secure monolithic architecture.

## 2. Tech Stack & Boundaries
- **Permitted Technologies**: Node.js, Express, PostgreSQL (`pg`), Vanilla JavaScript, modern Vanilla CSS.
- **Strict Prohibitions**: 
  - DO NOT introduce frontend frameworks (e.g., React, Angular, Vue, Svelte).
  - DO NOT introduce heavy ORMs (e.g., Prisma, TypeORM, Sequelize). Use raw SQL queries via the `pg` driver unless explicitly instructed otherwise.
  - DO NOT deviate from this stack.

## 3. Backend Engineering Rules
- **Controller/Service Pattern**: Strictly separate concerns. Controllers must only handle HTTP routing, request validation, and response formatting. Services must encapsulate all business logic and database interactions.
- **External API Resilience**: All external API calls MUST be executed using `Promise.allSettled` and MUST implement strict timeouts using `AbortSignal` to prevent cascading failures.
- **Database Operations**: 
  - Complex state mutations must be wrapped in explicit SQL transactions (`BEGIN`, `COMMIT`, `ROLLBACK`).
  - Exploit advanced PostgreSQL constructs—such as CTEs (Common Table Expressions) and `JSONB` functions/operators—to resolve complex data transformations at the database layer.

## 4. Code Style & Quality
- **No Redundant Comments**: Eliminate "AI slop" and trivial comments. Document only complex business logic, architectural decisions, and the "why" behind non-obvious implementations.
- **Strict Typing**: All code must be strictly typed. Use either formal TypeScript or rigorous JSDoc annotations for all function signatures, parameters, and return types.
- **Centralized Error Handling**: Do not swallow or locally log-and-forget errors. Route all backend exceptions through a centralized Express error-handling middleware.

## 5. UI/UX Rules
- **Secure DOM Manipulation**: Prevent XSS vulnerabilities by default. Never use `innerHTML` or `insertAdjacentHTML` with unsanitized user data; strictly use `textContent` and secure DOM APIs.
- **Modern & Lightweight CSS**: Write modern, semantic Vanilla CSS without bloated overhead. Leverage CSS variables, Grid, and Flexbox natively.
- **Premium Aesthetics**: Adhere to rich, dynamic UI standards. Preserve and enhance micro-animations and transitions. Generic, basic, or unpolished interfaces are explicitly forbidden.