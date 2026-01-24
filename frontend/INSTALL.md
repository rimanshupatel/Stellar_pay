# Installation Instructions

## Fix Dependency Issues

If you encounter peer dependency conflicts, use:

```bash
npm install --legacy-peer-deps
```

This will install all dependencies including:
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- React Icons (replaces lucide-react for React 19 compatibility)
- clsx & tailwind-merge

## After Installation

1. Make sure `tailwind.config.js` and `postcss.config.js` are in the `frontend/` directory
2. Run `npm run dev` to start the development server
3. The app should work with all modern UI components
