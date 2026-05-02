/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";
import tailwindcssAnimated from "tailwindcss-animated";

export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {
            colors: {
                primary: "#cf1df2",
                "primary-foreground": "#ffffff",
                secondary: "#0acefa",
                "secondary-foreground": "#001018",

                background: "#22262b",
                foreground: "#f4f4f5",

                border: "#3f3f46",
                input: "#3f3f46",
                ring: "#94c6f3",

                muted: "#2a2f36",
                "muted-foreground": "#a1a1aa",

                card: "#1b1e22",
                "card-foreground": "#f4f4f5",

                destructive: "#ef4444",
                "destructive-foreground": "#ffffff",

                nixo: "#94c6f3",
                navbar: "#1d232a",
                box: "#1b1e22",
                twitch: "#a970ff",
                green: "#00e022",
                red: "#ff0000",
            },
        },
    },
};