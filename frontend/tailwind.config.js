/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17191D',        // carbon
        carbon: '#17191D',
        carbon2: '#2C2F35',
        carbon3: '#0C0E11',
        paper: '#EFF1EC',
        lime: '#BEF264',       // bright lime accent
        limeink: '#4D7C0F',    // deep lime (accent text on light)
        stamp: '#4D7C0F',      // legacy alias
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
