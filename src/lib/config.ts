// API base URL is inlined at build time from VITE_API_BASE. The deploy workflow
// sets it to the production API origin; locally it defaults to the dev backend.
export const API_BASE = (
	(import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8000'
).replace(/\/$/, '');
