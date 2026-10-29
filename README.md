# NexaPanel — React Admin Dashboard

A modern, responsive admin dashboard built with React and Vite. NexaPanel provides a clean interface for managing orders, customers, analytics, and application settings.

<img width="1920" height="2174" alt="Dashboard" src="https://github.com/user-attachments/assets/e9728d54-def5-494b-82e2-e26054ff5fa6" />


<img width="1920" height="1114" alt="Orders" src="https://github.com/user-attachments/assets/c50b04a7-8670-41c4-8fe8-83cece0f761f" />


<img width="1920" height="1309" alt="Analytics" src="https://github.com/user-attachments/assets/8558475e-9c08-468b-9060-b091d550539f" />


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

<p align="left">
  <a href="https://react.dev/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  </a>
  <a href="https://vite.dev/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  </a>
  <a href="https://reactrouter.com/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router" />
  </a>
  <a href="https://recharts.org/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Recharts" />
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/CSS" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/CSS-663399?style=for-the-badge&logo=css&logoColor=white" alt="CSS" />
  </a>
  <a href="https://eslint.org/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" />
  </a>
</p>


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
