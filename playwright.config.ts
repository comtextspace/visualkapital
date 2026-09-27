import { defineConfig, devices } from '@playwright/test';

/**
 * E2e-тесты гоняются против собранного статического сайта (`npm run build` +
 * `npm run preview`), а не dev-сервера — так они проверяют именно то, что
 * реально уедет в прод (prerendered HTML + гидратация), а не поведение Vite
 * dev middleware.
 */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: 'list',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry'
	},
	webServer: {
		command: 'npm run build && npm run preview -- --port 4173',
		url: 'http://localhost:4173',
		reuseExistingServer: !process.env.CI,
		timeout: 60_000
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
