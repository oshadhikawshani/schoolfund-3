# SchoolFund Frontend

This is the frontend for the SchoolFund project, built with React, TypeScript, and Vite. It provides a fast, modern user interface for interacting with the SchoolFund platform.

## Features
- ⚡️ Fast development with Vite
- ⚛️ React for building UI components
- 🛡️ TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 📦 Modern build tooling

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. Navigate to the `frontend` directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

### Running the Development Server

```sh
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### Building for Production

```sh
npm run build
# or
yarn build
```

### Previewing the Production Build

```sh
npm run preview
# or
yarn preview
```

## Project Structure

```
frontend/
  ├── public/           # Static assets
  ├── src/              # Source code
  │   ├── assets/       # Static assets (e.g., SVGs)
  │   ├── images/       # Image files
  │   ├── pages/        # React page components
  │   ├── App.jsx       # Main app component
  │   └── main.jsx      # Entry point
  ├── index.html        # HTML template
  ├── package.json      # Project metadata and scripts
  └── ...
```

## Customization & Linting
- ESLint is configured for code quality. You can expand the rules in `eslint.config.js` as needed.
- Tailwind CSS is used for styling. Customize it in `tailwind.config.js` and `postcss.config.cjs`.
- TypeScript configuration is in `tsconfig.json` and related files.

## Useful Scripts
- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run lint` – Run ESLint (if configured)

## Learn More
- [React documentation](https://react.dev/)
- [Vite documentation](https://vitejs.dev/)
- [TypeScript documentation](https://www.typescriptlang.org/)
- [Tailwind CSS documentation](https://tailwindcss.com/)

---

Feel free to customize this README to better fit your project's needs!
