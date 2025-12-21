const colors = require('tailwindcss/colors');

module.exports = {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: colors.green,
			},
		},
		variants: {
			extend: {
				opacity: ['disabled'],
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
