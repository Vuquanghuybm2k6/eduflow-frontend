
# EduFlow Frontend - AI Development Guidelines

## Project Overview

EduFlow is a multi-tenant education management SaaS.

Frontend stack:

- React
- Vite
- React Router
- Zustand
- Axios
- Ant Design
- Tailwind CSS

## Project Structure

src/
├── components/
├── pages/
├── layouts/
├── routes/
├── hooks/
├── stores/
├── services/
├── utils/
├── types/
└── assets/

## Architecture

Use feature-oriented organization when appropriate.

Keep:

- UI components in components/
- API communication in services/
- global state in stores/
- reusable logic in hooks/
- routing in routes/

Do not put API calls directly inside large UI components.

## API

Use the shared Axios client.

Do not use fetch directly unless there is a specific reason.

API endpoints should be centralized.

Example:

services/
├── auth.service.js
├── student.service.js
├── teacher.service.js
└── class.service.js

## Authentication

Access tokens and refresh tokens must follow the existing authentication strategy.

Do not duplicate authentication logic across components.

Handle 401 responses through the shared Axios interceptor.

## State Management

Use Zustand for global state.

Do not put every piece of component state into Zustand.

Use useState for local UI state.

Use global state only when multiple parts of the application need the state.

## Forms

Use Ant Design Form for complex forms.

Validate user input before submitting.

Display backend validation errors clearly.

## Components

Prefer reusable components.

Avoid extremely large components.

Split complex pages into smaller components.

## Routing

Use React Router.

Protected routes must verify authentication and authorization.

Do not rely only on hiding UI elements for authorization.

The backend remains the source of truth for permissions.

## UI

Use Ant Design for common business components.

Use Tailwind for layout and custom styling where appropriate.

Keep the UI consistent.

## Error Handling

Handle:

- loading
- success
- empty state
- validation errors
- API errors

Do not silently ignore API errors.

## AI Instructions

Before creating a component:

1. Search for an existing reusable component.
2. Check existing design patterns.
3. Check existing API services.
4. Reuse existing state management.

Do not create duplicate components or utilities.

Do not modify unrelated files.

When implementing a page:

1. Define the page structure.
2. Connect API services.
3. Handle loading state.
4. Handle error state.
5. Handle empty state.
6. Implement permissions.
7. Make the page responsive.
