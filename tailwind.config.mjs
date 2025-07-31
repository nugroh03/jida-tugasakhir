// tailwind.config.mjs

/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './app/**/*.{js,ts,jsx,tsx}',   // Untuk App Router
      './pages/**/*.{js,ts,jsx,tsx}', // Jika masih pakai Pages Router
      './components/**/*.{js,ts,jsx,tsx}',
      './src/**/*.{js,ts,jsx,tsx}',   // Jika struktur kamu berada di /src
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  