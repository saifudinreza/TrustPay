/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#11203D',
        paper: '#EFF1EC',
        stamp: '#C98A2B',
        masuk: '#2F6F4E',
        keluar: '#7A3142',
        tepi: '#5C6B73',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        input: '10px',
        button: '10px',
      },
    },
  },
  plugins: [],
}
