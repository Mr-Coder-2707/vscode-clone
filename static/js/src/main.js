// src/main.ts
export const checkLandingSkip = () => {
    if (localStorage.getItem('skipLanding') === 'true') {
        window.location.href = '/editor';
    }
};
export const initTailwindConfig = () => {
    if (window.tailwind) {
        window.tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        vsc: {
                            bg: '#1e1e1e',
                            hover: '#2a2d2e',
                            border: '#3c3c3c',
                            blue: '#007acc',
                            blueHover: '#0062a3',
                            sidebar: '#252526',
                            text: '#cccccc'
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    }
                }
            }
        };
    }
};
document.addEventListener('DOMContentLoaded', () => {
    checkLandingSkip();
    initTailwindConfig();
});
//# sourceMappingURL=main.js.map