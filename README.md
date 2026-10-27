# NexaPanel — React Admin Dashboard

A modern, responsive admin dashboard built with React and Vite. NexaPanel provides a clean interface for managing orders, customers, analytics, and application settings.

## Features

- **Dashboard:** Overview of key metrics and business activity.
- **Order Management:** Create, view, edit, delete, search, and filter orders.
- **Order Details:** Dedicated pages for individual orders.
- **Customer Management:** Browse and search customer records.
- **Analytics:** Visualize business data with charts.
- **Settings:** Access application settings.
- **Dark Mode:** Switch themes with preference persistence.
- **Data Persistence:** Store order changes in browser local storage.
- **Responsive Layout:** Adapt the interface to different screen sizes.
- **Form Validation:** Validate order inputs before saving.
- **Optimized Loading:** Lazy-load pages to reduce the initial JavaScript bundle.
- **Client-side Routing:** Navigate between dashboard pages without full page reloads.

## Tech Stack

- React
- Vite
- React Router
- Recharts
- JavaScript
- CSS
- ESLint

## Getting Started

### Prerequisites

Install a recent version of Node.js and npm.

### Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd react-admin-dashboard
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed in the terminal.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint checks |
| `npm run build` | Build the production application |
| `npm run preview` | Preview the production build locally |

## Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the generated build:

```bash
npm run preview
```

The production files are generated in the `dist` directory.

## Data Storage

Order changes are persisted in the browser's local storage. This implementation is suitable for a front-end demonstration; it does not provide shared server-side storage or multi-user synchronization.

## Deployment

Build the project and deploy the contents of the `dist` directory to a static hosting provider.

If the application is deployed under a subpath, configure the Vite `base` option and hosting settings as needed. For client-side routes, ensure the hosting provider redirects application routes to `index.html`.

## Project Status

The project passes ESLint checks and builds successfully for production in the current development environment.

## License

No license has been specified yet. Add a `LICENSE` file before distributing the project under an open-source license.
