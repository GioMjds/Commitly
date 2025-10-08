/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./app/**/*.{js,jsx,ts,tsx}', './index.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                'primary': '#0F172A',
                'secondary': '#0EA5A4',
                'action': '#7C3AED',
                'neutral': '#E6EEF2',
            },
            fontFamily: {
                'hubot': ['HubotSans-Regular'],
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