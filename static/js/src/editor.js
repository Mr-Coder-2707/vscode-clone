// src/editor.ts
import { Resizer } from './ui/resizer';
import { compileCodeAPI } from './services/compiler';
export const themes = {
    'vs-dark': {
        base: 'vs-dark',
        '--vsc-bg': '#1e1e1e', '--vsc-activity-bar': '#333333', '--vsc-sidebar': '#252526',
        '--vsc-editor-bg': '#1e1e1e', '--vsc-panel-bg': '#1e1e1e', '--vsc-text': '#cccccc',
        '--vsc-border': '#2d2d2d', '--vsc-tab-active': '#1e1e1e', '--vsc-titlebar': '#323233',
        '--vsc-statusbar': '#007acc', '--vsc-highlight': '#37373d', '--vsc-sidebar-header': '#bbbbbb', '--vsc-accent': '#007fd4'
    },
    'vs': {
        base: 'vs',
        '--vsc-bg': '#ffffff', '--vsc-activity-bar': '#2c2c2c', '--vsc-sidebar': '#f3f3f3',
        '--vsc-editor-bg': '#ffffff', '--vsc-panel-bg': '#ffffff', '--vsc-text': '#333333',
        '--vsc-border': '#e4e4e4', '--vsc-tab-active': '#ffffff', '--vsc-titlebar': '#dddddd',
        '--vsc-statusbar': '#007acc', '--vsc-highlight': '#e4e6f1', '--vsc-sidebar-header': '#666666', '--vsc-accent': '#007fd4'
    },
    // ... add more themes as needed
};
const defaultExamples = {
    "1": { name: "1. Simple Arithmetic", code: "a = 5 + 3\nb = 10 - 2\nc = a * b" },
    "2": { name: "2. Variables", code: "x = 7\ny = x + 5\nz = y * x" },
    "3": { name: "3. Simple if-else", code: "x = 10\n\nif x > 5:\n    y = x + 1\nelse:\n    y = x * 2" },
    "4": { name: "4. Nested if", code: "x = 10\ny = 5\n\nif x > 5:\n    if y < 10:\n        z = x + y\n    else:\n        z = x - y\nelse:\n    z = 0" },
    "5": { name: "5. Semantic Error", code: "x = 5\ny = x + z   # Error" },
    "6": { name: "6. Calculate Invoice", code: "price = 100\ndiscount = 20\n\nfinal = price - discount\n\nif final > 50:\n    tax = final * 2\nelse:\n    tax = final + 5\n\ntotal = final + tax" },
    "7": { name: "7. Full Demo", code: "a = 5\nb = 10\nc = a + b * 2\n\nif c > 20:\n    d = c - 5\n    if d > 10:\n        e = d * 2\n    else:\n        e = d + 3\nelse:\n    d = c + 5\n    e = d - 2\n\nresult = e + a" }
};
let examples = {};
let activeFileKey = null;
let newFileCounter = 1;
try {
    const savedExamples = localStorage.getItem('vsc_examples_v2');
    if (savedExamples) {
        examples = JSON.parse(savedExamples);
    }
    else {
        examples = JSON.parse(JSON.stringify(defaultExamples));
    }
}
catch (e) {
    examples = JSON.parse(JSON.stringify(defaultExamples));
}
function saveExamples() {
    if (activeFileKey && examples[activeFileKey] && window.editor) {
        examples[activeFileKey].code = window.editor.getValue();
    }
    localStorage.setItem('vsc_examples_v2', JSON.stringify(examples));
}
export function changeTheme(themeName) {
    const selectedTheme = themes[themeName];
    if (!selectedTheme)
        return;
    const root = document.documentElement;
    for (const key in selectedTheme) {
        if (key !== 'base')
            root.style.setProperty(key, selectedTheme[key]);
    }
    const statusBg = selectedTheme['--vsc-statusbar'] || '#007acc';
    const lightBackgrounds = ['#ffffff', '#fdf6e3', '#ffb454', '#dddddd'];
    if (lightBackgrounds.includes(statusBg.toLowerCase())) {
        root.style.setProperty('--vsc-statusbar-fg', '#000000');
    }
    else {
        root.style.setProperty('--vsc-statusbar-fg', '#ffffff');
    }
    if ((selectedTheme.base || themeName) === 'vs' || (selectedTheme.base || themeName) === 'hc-light') {
        root.style.colorScheme = 'light';
    }
    else {
        root.style.colorScheme = 'dark';
    }
    if (window.editor && window.monaco) {
        const baseTheme = selectedTheme.base || themeName;
        window.monaco.editor.defineTheme('custom-' + themeName, {
            base: baseTheme,
            inherit: true,
            rules: [],
            colors: {
                'editor.background': selectedTheme['--vsc-editor-bg'],
                'editor.foreground': selectedTheme['--vsc-text'],
                'editorLineNumber.foreground': selectedTheme['--vsc-sidebar-header'],
                'editorIndentGuide.background': selectedTheme['--vsc-border']
            }
        });
        window.monaco.editor.setTheme('custom-' + themeName);
    }
    const toggle = document.getElementById('toggle-default-theme');
    if (toggle) {
        toggle.checked = localStorage.getItem('selectedTheme') === themeName;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // 1. Resizers
    new Resizer(document.getElementById('panel-resizer'), document.getElementById('bottom-panel'), 'panel');
    new Resizer(document.getElementById('sidebar-resizer'), document.getElementById('sidebar'), 'sidebar');
    // 2. Initialize Theme
    const savedTheme = localStorage.getItem('selectedTheme') || 'vs-dark';
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector)
        themeSelector.value = savedTheme;
    changeTheme(savedTheme);
    themeSelector?.addEventListener('change', (e) => {
        changeTheme(e.target.value);
    });
    // 3. Initialize Monaco Editor
    if (window.require) {
        window.require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' } });
        window.require(['vs/editor/editor.main'], function () {
            const initialThemeIdentifier = savedTheme || 'vs-dark';
            const baseTheme = themes[initialThemeIdentifier] ? (themes[initialThemeIdentifier].base || initialThemeIdentifier) : 'vs-dark';
            const container = document.getElementById('monaco-container');
            if (container) {
                window.editor = window.monaco.editor.create(container, {
                    value: "x = 5 + 3\ny = x * 2",
                    language: 'python', theme: baseTheme, automaticLayout: true,
                    fontSize: 14, fontFamily: "'Courier New', Consolas, monospace"
                });
                changeTheme(initialThemeIdentifier);
                window.editor?.onDidChangeCursorPosition((e) => {
                    const el = document.getElementById('cursor-position');
                    if (el)
                        el.innerText = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
                });
                window.editor?.onDidChangeModelContent(() => saveExamples());
                if (examples["6"]) {
                    loadExample("6", null);
                }
                else {
                    const keys = Object.keys(examples);
                    if (keys.length > 0)
                        loadExample(keys[0], null);
                }
                setTimeout(() => {
                    const ls = document.getElementById('loading-screen');
                    if (ls) {
                        ls.style.opacity = '0';
                        ls.style.visibility = 'hidden';
                        setTimeout(() => ls.remove(), 500);
                    }
                }, 500);
            }
        });
    }
    renderList();
});
function loadExample(key, element) {
    if (!examples[key])
        return;
    if (activeFileKey && examples[activeFileKey] && window.editor) {
        examples[activeFileKey].code = window.editor.getValue();
    }
    activeFileKey = key;
    document.querySelectorAll('#example-list li').forEach(el => el.classList.remove('active'));
    if (element)
        element.classList.add('active');
    else {
        const el = document.getElementById('file-item-' + key);
        if (el)
            el.classList.add('active');
    }
    if (window.editor)
        window.editor.setValue(examples[key].code);
    const statusbarTabs = document.querySelectorAll('.status-item');
    if (statusbarTabs[1])
        statusbarTabs[1].innerText = examples[key].name;
    const editorTabs = document.querySelectorAll('.editor-tab');
    if (editorTabs[0])
        editorTabs[0].innerHTML = `<span class="material-icons-round" style="color: #4B8BBE;">code</span> ${examples[key].name}`;
}
function renderList() {
    const list = document.getElementById('example-list');
    if (!list)
        return;
    list.innerHTML = '';
    const liTemplate = `<span class="material-icons-round">description</span> `;
    for (const [key, val] of Object.entries(examples)) {
        const li = document.createElement('li');
        li.id = 'file-item-' + key;
        const span = document.createElement('span');
        span.className = 'filename';
        span.style.flexGrow = '1';
        span.style.whiteSpace = 'nowrap';
        span.style.overflow = 'hidden';
        span.style.textOverflow = 'ellipsis';
        span.innerText = val.name;
        li.innerHTML = liTemplate;
        li.appendChild(span);
        li.onclick = (e) => {
            if (e.target.tagName.toLowerCase() === 'input')
                return;
            loadExample(key, li);
        };
        list.appendChild(li);
        // Add the original backend communication code
        function updatePanelContent(tabId, html) {
            const el = document.getElementById('tab-' + tabId);
            if (el)
                el.innerHTML = html;
        }
        function clearPanel() {
            document.querySelectorAll('.panel-content-inner').forEach(t => t.innerHTML = '');
        }
        function buildTreeHtml(node) {
            if (!node)
                return '';
            let html = `<li><span style="color:#dcdcaa">${node.name}</span>`;
            if (node.children && node.children.length > 0) {
                html += '<ul class="tree">';
                for (let child of node.children)
                    html += buildTreeHtml(child);
                html += '</ul>';
            }
            html += '</li>';
            return `<ul class="tree">${html}</ul>`;
        }
        async function compileCode() {
            const statusEl = document.getElementById('compilation-status');
            if (statusEl)
                statusEl.innerText = "Compiling...";
            updatePanelContent('output', '> Running Pipeline...');
            if (!window.editor) {
                updatePanelContent('output', '> Editor not ready.');
                return;
            }
            try {
                const result = await compileCodeAPI(window.editor.getValue());
                if (result.error) {
                    updatePanelContent('tokens', `<span style="color:#f48771">${result.error}:<br>${result.details?.join('<br>')}</span>`);
                    if (statusEl)
                        statusEl.innerText = "Error";
                }
                else {
                    if (statusEl)
                        statusEl.innerText = "Success";
                    if (result.tokens) {
                        const tHtml = result.tokens.map(t => `<span style="color:#ce9178">Token</span>(${t.type}, "<span style="color:#4ec9b0">${t.value}</span>") <span style="color:#6a9955">// L${t.line}</span>`).join('<br>');
                        updatePanelContent('tokens', tHtml);
                    }
                    if (result.ast)
                        updatePanelContent('ast', buildTreeHtml(result.ast));
                    if (result.semantic)
                        updatePanelContent('semantic', `<span style="color:#89d185">✔️ ${result.semantic}</span>`);
                    if (result.ir)
                        updatePanelContent('ir', result.ir.join('<br>'));
                    if (result.assembly)
                        updatePanelContent('assembly', result.assembly.replace(/\n/g, '<br>'));
                    updatePanelContent('output', '<span style="color:#89d185">[Success] Pipeline finished successfully.</span>');
                }
            }
            catch (err) {
                updatePanelContent('output', err.message);
            }
        }
        // Make globally accessible for the Run button
        window.compileCode = compileCode;
    }
}
//# sourceMappingURL=editor.js.map