// main.js

// إذا كان المستخدم قد دخل المحرر مسبقاً، تحويله تلقائياً
if (localStorage.getItem('skipLanding') === 'true') {
    window.location.href = '/editor';
}

tailwind.config = {
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