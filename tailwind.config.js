/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./app/**/*.{js,jsx,ts,tsx}',
		'./index.{js,jsx,ts,tsx}',
		'./components/**/*.{js,jsx,ts,tsx}',
	],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				primary: '#0F172A',
				secondary: '#0EA5A4',
				action: '#7C3AED',
				neutral: '#E6EEF2',

				/* ---------- semantic tokens (light theme) ---------- */
				bg: '#F8FAFC', // app background (light)
				surface: '#FFFFFF', // surface / cards
				card: '#FFFFFF',
				text: '#0F172A', // primary body text (uses your primary as dark text)
				muted: '#475569', // secondary text / metadata
				border: '#E6EEF2', // subtle border / divider (keeps your neutral)
				accent: '#334155', // brand accent (slightly lighter indigo for highlights)
				'accent-weak': '#6366F1', // alternate accent for micro-interactions
				success: '#10B981', // success / positive
				warning: '#F59E0B', // warning
				danger: '#EF4444', // danger / error

				/* ---------- semantic tokens (dark theme) ---------- */
				'bg-dark': '#0B1220', // app background (dark)
				'surface-dark': '#0F172A', // surfaces / cards in dark
				'card-dark': '#111827',
				'text-dark': '#E6EEF2', // body text in dark
				'muted-dark': '#9CA3AF', // secondary text in dark
				'border-dark': '#1F2937', // border in dark
				'accent-dark': '#06B6D4', // keep your teal as accent in dark
				'accent-weak-dark': '#7C3AED', // purple action stands out on dark
				'success-dark': '#34D399',
				'warning-dark': '#FBBF24',
				'danger-dark': '#F87171',
			},
			fontFamily: {
				hubot: ['HubotSans-Regular'],
				'hubot-black': ['HubotSans-Black'],
				'hubot-extrabold': ['HubotSans-ExtraBold'],
				'hubot-extralight': ['HubotSans-ExtraLight'],
				'hubot-light': ['HubotSans-Light'],
				'hubot-medium': ['HubotSans-Medium'],
				'hubot-semibold': ['HubotSans-SemiBold'],
			},
		},
	},
};
