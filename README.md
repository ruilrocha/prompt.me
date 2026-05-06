# prompt.me

The frontend for **prompt.me** — a daily creative writing prompt site. Built with [Astro](https://astro.build) and deployed on Vercel.

Prompts are fetched at request time from a separate Hono backend. This app is purely a display layer — no AI calls, no database.

## Project Structure

```text
/
├── public/
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── image.jpg          # Background image
│   ├── components/
│   │   └── PromptCard.astro   # Card component (variants: glow | plus)
│   ├── layouts/
│   │   └── Layout.astro       # Base HTML layout with background
│   ├── pages/
│   │   └── index.astro        # Main page — fetches and displays today's prompt
│   └── styles/
│       └── global.css         # Tailwind base styles
├── .env.example               # Required environment variables
└── package.json
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```sh
cp .env.example .env.local
```

| Variable | Description |
| :------- | :---------- |
| `BACKEND_URL` | Base URL of the Hono backend, e.g. `https://your-backend.vercel.app` |
| `BACKEND_API_KEY` | Shared secret sent as `x-api-key` header to the backend |

## Commands

| Command | Action |
| :------ | :----- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build for production to `./dist/` |
| `npm run preview` | Preview the production build locally |

## Deployment

Deploys automatically to Vercel on push. Set `BACKEND_URL` and `BACKEND_API_KEY` in Vercel → Settings → Environment Variables.

The backend is a separate service responsible for AI prompt generation and storage.
