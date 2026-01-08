import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				// Brand colors
				brand: {
					yellow: '#E0F146',
					gray: '#D9D9D9',
					navy: '#0B101F',
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			typography: {
				DEFAULT: {
					css: {
						color: 'hsl(var(--foreground))',
						a: {
							color: 'hsl(var(--primary))',
							'&:hover': {
								color: 'hsl(var(--primary) / 0.8)'
							}
						},
						'h1, h2, h3, h4, h5, h6': {
							color: 'hsl(var(--foreground))'
						},
						blockquote: {
							color: 'hsl(var(--muted-foreground))',
							borderLeftColor: 'hsl(var(--primary))'
						},
						hr: {
							borderColor: 'hsl(var(--border))'
						},
						strong: {
							color: 'hsl(var(--foreground))'
						},
						code: {
							color: 'hsl(var(--primary))',
							backgroundColor: 'hsl(var(--muted))',
							borderRadius: '0.25rem',
							padding: '0.25rem'
						},
						pre: {
							backgroundColor: 'hsl(var(--muted))',
							code: {
								backgroundColor: 'transparent',
								color: 'inherit',
								padding: '0'
							}
						}
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			}
		}
	},
	plugins: [
		tailwindcssAnimate,
		typography,
	],
};

export default config;

