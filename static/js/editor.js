// Panel Resizing Logic
        const panelResizer = document.getElementById('panel-resizer');
        const bottomPanel = document.getElementById('bottom-panel');
        const editorArea = document.getElementById('editor-area');
        
        let isPanelResizing = false;

        function doPanelResize(clientY) {
            const containerRect = editorArea.getBoundingClientRect();
            // Calculate new height from bottom of container to touch/mouse position
            let newHeight = containerRect.bottom - clientY;
            
            // Constrain the height
            if (newHeight < 40) newHeight = 40; // min height (approx collapsed)
            if (newHeight > containerRect.height - 100) newHeight = containerRect.height - 100; // leave some space for editor
            
            bottomPanel.style.height = `${newHeight}px`;
            
            // Let monaco know it needs to resize
            if (window.editor) {
                window.editor.layout();
            }
        }

        panelResizer.addEventListener('mousedown', function(e) {
            isPanelResizing = true;
            panelResizer.classList.add('resizing');
            document.body.style.cursor = 'ns-resize';
            document.addEventListener('mousemove', handlePanelMouseMove);
            document.addEventListener('mouseup', handlePanelMouseUp);
        });
        
        panelResizer.addEventListener('touchstart', function(e) {
            isPanelResizing = true;
            panelResizer.classList.add('resizing');
            document.addEventListener('touchmove', handlePanelTouchMove, { passive: false });
            document.addEventListener('touchend', handlePanelTouchEnd);
        }, { passive: true });

        function handlePanelMouseMove(e) {
            if (!isPanelResizing) return;
            doPanelResize(e.clientY);
        }

        function handlePanelTouchMove(e) {
            if (!isPanelResizing) return;
            e.preventDefault(); // prevent scrolling while resizing
            doPanelResize(e.touches[0].clientY);
        }

        function handlePanelMouseUp(e) {
            if (!isPanelResizing) return;
            isPanelResizing = false;
            panelResizer.classList.remove('resizing');
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', handlePanelMouseMove);
            document.removeEventListener('mouseup', handlePanelMouseUp);
        }
        
        function handlePanelTouchEnd(e) {
            if (!isPanelResizing) return;
            isPanelResizing = false;
            panelResizer.classList.remove('resizing');
            document.removeEventListener('touchmove', handlePanelTouchMove);
            document.removeEventListener('touchend', handlePanelTouchEnd);
        }

        // Sidebar Resizing Logic
        const sidebarResizer = document.getElementById('sidebar-resizer');
        const sidebar = document.getElementById('sidebar');
        
        let isSidebarResizing = false;

        function doSidebarResize(clientX, clientY) {
            if (window.innerWidth <= 768) {
                // On mobile, the sidebar is above the resizer in a column flex layout
                const activityBarRect = document.getElementById('activity-bar').getBoundingClientRect();
                let newHeight = clientY - activityBarRect.bottom;
                
                if (newHeight < 50) newHeight = 50;
                if (newHeight > window.innerHeight * 0.5) newHeight = window.innerHeight * 0.5; // max 50% of screen height
                
                sidebar.style.height = `${newHeight}px`;
                sidebar.style.width = '100%'; // ensure width stays 100%
            } else {
                // On desktop, the sidebar is to the left in a row flex layout
                const activityBarWidth = document.getElementById('activity-bar').offsetWidth;
                let newWidth = clientX - activityBarWidth;
                
                if (newWidth < 50) newWidth = 50; 
                if (newWidth > window.innerWidth * 0.6) newWidth = window.innerWidth * 0.6; // max 60% of screen
                
                sidebar.style.width = `${newWidth}px`;
                sidebar.style.height = 'auto'; // ensure height behaves normally
            }
            if (window.editor) {
                window.editor.layout();
            }
        }

        sidebarResizer.addEventListener('mousedown', function(e) {
            isSidebarResizing = true;
            sidebarResizer.classList.add('resizing');
            document.body.style.cursor = window.innerWidth <= 768 ? 'ns-resize' : 'ew-resize';
            
            document.addEventListener('mousemove', handleSidebarMouseMove);
            document.addEventListener('mouseup', handleSidebarMouseUp);
            e.preventDefault();
        });
        
        sidebarResizer.addEventListener('touchstart', function(e) {
            isSidebarResizing = true;
            sidebarResizer.classList.add('resizing');
            
            document.addEventListener('touchmove', handleSidebarTouchMove, { passive: false });
            document.addEventListener('touchend', handleSidebarTouchEnd);
        }, { passive: true });

        function handleSidebarMouseMove(e) {
            if (!isSidebarResizing) return;
            doSidebarResize(e.clientX, e.clientY);
        }

        function handleSidebarTouchMove(e) {
            if (!isSidebarResizing) return;
            e.preventDefault(); // prevent scrolling
            doSidebarResize(e.touches[0].clientX, e.touches[0].clientY);
        }

        function handleSidebarMouseUp(e) {
            if (!isSidebarResizing) return;
            isSidebarResizing = false;
            sidebarResizer.classList.remove('resizing');
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', handleSidebarMouseMove);
            document.removeEventListener('mouseup', handleSidebarMouseUp);
        }
        
        function handleSidebarTouchEnd(e) {
            if (!isSidebarResizing) return;
            isSidebarResizing = false;
            sidebarResizer.classList.remove('resizing');
            document.removeEventListener('touchmove', handleSidebarTouchMove);
            document.removeEventListener('touchend', handleSidebarTouchEnd);
        }


        const themes = {
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
            'hc-black': {
                base: 'hc-black',
                '--vsc-bg': '#000000', '--vsc-activity-bar': '#000000', '--vsc-sidebar': '#000000',
                '--vsc-editor-bg': '#000000', '--vsc-panel-bg': '#000000', '--vsc-text': '#ffffff',
                '--vsc-border': '#6fc3df', '--vsc-tab-active': '#000000', '--vsc-titlebar': '#000000',
                '--vsc-statusbar': '#000000', '--vsc-highlight': '#000000', '--vsc-sidebar-header': '#ffffff', '--vsc-accent': '#6fc3df'
            },
            'hc-light': {
                base: 'hc-light',
                '--vsc-bg': '#ffffff', '--vsc-activity-bar': '#ffffff', '--vsc-sidebar': '#ffffff',
                '--vsc-editor-bg': '#ffffff', '--vsc-panel-bg': '#ffffff', '--vsc-text': '#000000',
                '--vsc-border': '#0f4a85', '--vsc-tab-active': '#ffffff', '--vsc-titlebar': '#ffffff',
                '--vsc-statusbar': '#ffffff', '--vsc-highlight': '#ffffff', '--vsc-sidebar-header': '#000000', '--vsc-accent': '#0f4a85'
            },
            'monokai': {
                base: 'vs-dark',
                '--vsc-bg': '#272822', '--vsc-activity-bar': '#1e1f1c', '--vsc-sidebar': '#1e1f1c',
                '--vsc-editor-bg': '#272822', '--vsc-panel-bg': '#272822', '--vsc-text': '#f8f8f2',
                '--vsc-border': '#414339', '--vsc-tab-active': '#272822', '--vsc-titlebar': '#1e1f1c',
                '--vsc-statusbar': '#be3d3c', '--vsc-highlight': '#414339', '--vsc-sidebar-header': '#75715e', '--vsc-accent': '#f92672'
            },
            'dracula': {
                base: 'vs-dark',
                '--vsc-bg': '#282a36', '--vsc-activity-bar': '#343746', '--vsc-sidebar': '#21222c',
                '--vsc-editor-bg': '#282a36', '--vsc-panel-bg': '#282a36', '--vsc-text': '#f8f8f2',
                '--vsc-border': '#44475a', '--vsc-tab-active': '#282a36', '--vsc-titlebar': '#21222c',
                '--vsc-statusbar': '#bd93f9', '--vsc-highlight': '#44475a', '--vsc-sidebar-header': '#6272a4', '--vsc-accent': '#ff79c6'
            },
            'github-dark': {
                base: 'vs-dark',
                '--vsc-bg': '#0d1117', '--vsc-activity-bar': '#0d1117', '--vsc-sidebar': '#010409',
                '--vsc-editor-bg': '#0d1117', '--vsc-panel-bg': '#0d1117', '--vsc-text': '#c9d1d9',
                '--vsc-border': '#30363d', '--vsc-tab-active': '#0d1117', '--vsc-titlebar': '#010409',
                '--vsc-statusbar': '#1f6feb', '--vsc-highlight': '#21262d', '--vsc-sidebar-header': '#8b949e', '--vsc-accent': '#58a6ff'
            },
            'github-light': {
                base: 'vs',
                '--vsc-bg': '#ffffff', '--vsc-activity-bar': '#ffffff', '--vsc-sidebar': '#f6f8fa',
                '--vsc-editor-bg': '#ffffff', '--vsc-panel-bg': '#ffffff', '--vsc-text': '#24292f',
                '--vsc-border': '#d0d7de', '--vsc-tab-active': '#ffffff', '--vsc-titlebar': '#f6f8fa',
                '--vsc-statusbar': '#0969da', '--vsc-highlight': '#f3f4f6', '--vsc-sidebar-header': '#57606a', '--vsc-accent': '#0969da'
            },
            'solarized-dark': {
                base: 'vs-dark',
                '--vsc-bg': '#002b36', '--vsc-activity-bar': '#00212b', '--vsc-sidebar': '#00212b',
                '--vsc-editor-bg': '#002b36', '--vsc-panel-bg': '#002b36', '--vsc-text': '#839496',
                '--vsc-border': '#073642', '--vsc-tab-active': '#002b36', '--vsc-titlebar': '#00212b',
                '--vsc-statusbar': '#2aa198', '--vsc-highlight': '#073642', '--vsc-sidebar-header': '#586e75', '--vsc-accent': '#268bd2'
            },
            'solarized-light': {
                base: 'vs',
                '--vsc-bg': '#fdf6e3', '--vsc-activity-bar': '#eee8d5', '--vsc-sidebar': '#eee8d5',
                '--vsc-editor-bg': '#fdf6e3', '--vsc-panel-bg': '#fdf6e3', '--vsc-text': '#657b83',
                '--vsc-border': '#d3c6a6', '--vsc-tab-active': '#fdf6e3', '--vsc-titlebar': '#eee8d5',
                '--vsc-statusbar': '#2aa198', '--vsc-highlight': '#e8dfc6', '--vsc-sidebar-header': '#93a1a1', '--vsc-accent': '#268bd2'
            },
            'synthwave': {
                base: 'vs-dark',
                '--vsc-bg': '#262335', '--vsc-activity-bar': '#241b2f', '--vsc-sidebar': '#241b2f',
                '--vsc-editor-bg': '#2a2139', '--vsc-panel-bg': '#262335', '--vsc-text': '#ffffff',
                '--vsc-border': '#495495', '--vsc-tab-active': '#2a2139', '--vsc-titlebar': '#241b2f',
                '--vsc-statusbar': '#ff7edb', '--vsc-highlight': '#34294f', '--vsc-sidebar-header': '#ffffff', '--vsc-accent': '#f92aad'
            },
            'ayu-dark-gold': {
                base: 'vs-dark',
                '--vsc-bg': '#0b0e14', '--vsc-activity-bar': '#0b0e14', '--vsc-sidebar': '#151a21',
                '--vsc-editor-bg': '#0b0e14', '--vsc-panel-bg': '#0b0e14', '--vsc-text': '#bfbdb6',
                '--vsc-border': '#1b212c', '--vsc-tab-active': '#0b0e14', '--vsc-titlebar': '#0b0e14',
                '--vsc-statusbar': '#ffb454', '--vsc-highlight': '#1e2430', '--vsc-sidebar-header': '#8a9199', '--vsc-accent': '#ffb454'
            }
        };

        function changeTheme(themeName) {
            const selectedTheme = themes[themeName];
            if (!selectedTheme) return;
            
            const root = document.documentElement;
            for (const key in selectedTheme) {
                if (key !== 'base') root.style.setProperty(key, selectedTheme[key]);
            }
            
            // Auto text color calculation for status bar
            const statusBg = selectedTheme['--vsc-statusbar'] || '#007acc';
            const lightBackgrounds = ['#ffffff', '#fdf6e3', '#ffb454', '#dddddd'];
            if (lightBackgrounds.includes(statusBg.toLowerCase())) {
                root.style.setProperty('--vsc-statusbar-fg', '#000000'); 
            } else {
                root.style.setProperty('--vsc-statusbar-fg', '#ffffff'); 
            }

            if ((selectedTheme.base || themeName) === 'vs' || (selectedTheme.base || themeName) === 'hc-light') {
                root.style.colorScheme = 'light';
            } else {
                root.style.colorScheme = 'dark';
            }
            
            if (editor && window.monaco) {
                const baseTheme = selectedTheme.base || themeName;
                monaco.editor.defineTheme('custom-' + themeName, {
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
                monaco.editor.setTheme('custom-' + themeName);
            }
            
            // Check if current theme matches the saved default to update the toggle visually
            const toggle = document.getElementById('toggle-default-theme');
            if (toggle) {
                toggle.checked = localStorage.getItem('selectedTheme') === themeName;
            }
        }

        function toggleDefaultTheme() {
            const toggle = document.getElementById('toggle-default-theme');
            const themeName = document.getElementById('theme-selector').value;
            
            // If toggled ON, save current theme as default. If OFF, maybe do nothing or remove.
            if (toggle.checked) {
                localStorage.setItem('selectedTheme', themeName);
            } else {
                localStorage.removeItem('selectedTheme');
            }
        }
        
        // Restore theme on load
        const savedTheme = localStorage.getItem('selectedTheme') || 'vs-dark';
        window.addEventListener('DOMContentLoaded', () => {
            const themeSelector = document.getElementById('theme-selector');
            if (themeSelector) themeSelector.value = savedTheme;
            changeTheme(savedTheme);
        });

        const defaultExamples = {
            "1": { name: "1. Simple Arithmetic", code: "a = 5 + 3\nb = 10 - 2\nc = a * b" },
            "2": { name: "2. Variables", code: "x = 7\ny = x + 5\nz = y * x" },
            "3": { name: "3. Simple if-else", code: "x = 10\n\nif x > 5:\n    y = x + 1\nelse:\n    y = x * 2" },
            "4": { name: "4. Nested if", code: "x = 10\ny = 5\n\nif x > 5:\n    if y < 10:\n        z = x + y\n    else:\n        z = x - y\nelse:\n    z = 0" },
            "5": { name: "5. Semantic Error", code: "x = 5\ny = x + z   # Error" },
            "6": { name: "6. Calculate Invoice", code: "price = 100\ndiscount = 20\n\nfinal = price - discount\n\nif final > 50:\n    tax = final * 2\nelse:\n    tax = final + 5\n\ntotal = final + tax" },
            "7": { name: "7. Full Demo", code: "a = 5\nb = 10\nc = a + b * 2\n\nif c > 20:\n    d = c - 5\n    if d > 10:\n        e = d * 2\n    else:\n        e = d + 3\nelse:\n    d = c + 5\n    e = d - 2\n\nresult = e + a" }
        };

        // Load examples from localStorage if available, otherwise use defaults
        let examples = {};
        try {
            const savedExamples = localStorage.getItem('vsc_examples_v2');
            if (savedExamples) {
                examples = JSON.parse(savedExamples);
            } else {
                examples = JSON.parse(JSON.stringify(defaultExamples));
            }
        } catch(e) {
            examples = JSON.parse(JSON.stringify(defaultExamples));
        }

        function saveExamples() {
            if (activeFileKey && examples[activeFileKey] && editor) {
                examples[activeFileKey].code = editor.getValue();
            }
            localStorage.setItem('vsc_examples_v2', JSON.stringify(examples));
        }

        let editor;
        window.activeEditorInstance = null; // Expose to window for external access
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' }});
        require(['vs/editor/editor.main'], function() {
            const initialThemeIdentifier = savedTheme || 'vs-dark';
            const baseTheme = themes[initialThemeIdentifier] ? (themes[initialThemeIdentifier].base || initialThemeIdentifier) : 'vs-dark';
            
            editor = monaco.editor.create(document.getElementById('monaco-container'), {
                value: "x = 5 + 3\ny = x * 2",
                language: 'python', theme: baseTheme, automaticLayout: true,
                fontSize: 14, fontFamily: "'Courier New', Consolas, monospace"
            });
            window.activeEditorInstance = editor; // Add global context

            // Re-apply the loaded theme now that the editor is ready
            changeTheme(initialThemeIdentifier);
            
            editor.onDidChangeCursorPosition(e => document.getElementById('cursor-position').innerText = `Ln ${e.position.lineNumber}, Col ${e.position.column}`);
            
            editor.onDidChangeModelContent((e) => {
                // Auto-save typing changes to examples memory
                if (activeFileKey && examples[activeFileKey]) {
                    examples[activeFileKey].code = editor.getValue();
                    saveExamples();
                }
            });

            // Load the first available example if key "6" doesn't exist
            if (examples["6"]) {
                loadExample("6"); 
            } else {
                const keys = Object.keys(examples);
                if(keys.length > 0) loadExample(keys[0]);
            }

            // Hide loading screen once Monaco is ready
            setTimeout(() => {
                const ls = document.getElementById('loading-screen');
                if (ls) {
                    ls.style.opacity = '0';
                    ls.style.visibility = 'hidden';
                    setTimeout(() => ls.remove(), 500); // Remove from DOM after fade out
                }
            }, 500); // small delay to make the transition smooth
        });

        let activeFileKey = null;

        function loadExample(key, element) {
            if (!examples[key]) return;
            
            // Save current content to current active file before switching
            if (activeFileKey && examples[activeFileKey] && editor) {
                examples[activeFileKey].code = editor.getValue();
            }
            
            activeFileKey = key;
            document.querySelectorAll('#example-list li').forEach(el => el.classList.remove('active'));
            if(element) element.classList.add('active');
            else {
                const el = document.getElementById('file-item-' + key);
                if (el) el.classList.add('active');
            }
            if (editor) editor.setValue(examples[key].code);
            // update status bar filename
            const statusbarTabs = document.querySelectorAll('.status-item');
            if (statusbarTabs[1]) statusbarTabs[1].innerText = examples[key].name;
            const editorTabs = document.querySelectorAll('.editor-tab');
            if (editorTabs[0]) editorTabs[0].innerHTML = `<span class="material-icons-round" style="color: #4B8BBE;">code</span> ${examples[key].name}`;
        }

        const liTemplate = `<span class="material-icons-round">description</span> `;
        let activeKeyForMenu = null;
        let newFileCounter = 1;

        // Create new file when double clicking empty space in sidebar
        const mainSidebar = document.getElementById('sidebar');
        if (mainSidebar) {
            mainSidebar.addEventListener('dblclick', (e) => {
                // Only create file if explorer is active or we are generally in the sidebar
                const isItem = e.target.closest('li') || e.target.tagName.toLowerCase() === 'input';
                // Also ignore clicks on sidebar headers/titles to avoid accidental creation
                const isTitle = e.target.classList.contains('sidebar-title') || e.target.classList.contains('section-header') || e.target.closest('.sidebar-title') || e.target.closest('.section-header');
                
                if (!isItem && !isTitle) {
                    // Automatically switch to explorer pane if not active
                    if (typeof switchSidebar === 'function') {
                        switchSidebar('explorer', document.querySelector('.activity-icon[title="Explorer"]'));
                    }
                    
                    const newKey = 'new_' + Date.now();
                    examples[newKey] = { name: `Untitled-${newFileCounter++}.py`, code: '' };
                    saveExamples();
                    renderList();
                    loadExample(newKey, document.getElementById('file-item-' + newKey));
                    startRename(newKey);
                }
            });
        }

        document.addEventListener('click', (e) => {
            const contextMenu = document.getElementById('context-menu');
            if (contextMenu.style.display === 'block') {
                contextMenu.style.display = 'none';
            }
        });

        document.getElementById('menu-rename').onclick = (e) => {
            if (activeKeyForMenu) startRename(activeKeyForMenu);
        };
        
        function showVscConfirm(message, confirmText = 'Delete') {
            return new Promise((resolve) => {
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;user-select:none;';
                
                const dialog = document.createElement('div');
                dialog.style.cssText = 'background:#252526;border:1px solid #454545;box-shadow:0 4px 20px rgba(0,0,0,0.5);width:450px;max-width:90vw;display:flex;flex-direction:column;border-radius:4px;';
                
                const content = document.createElement('div');
                content.style.cssText = 'padding:16px 20px;color:#cccccc;font-size:13px;display:flex;align-items:center;gap:10px;';
                
                const iconInfo = document.createElement('span');
                iconInfo.className = 'material-icons-round';
                iconInfo.textContent = 'warning';
                iconInfo.style.cssText = 'color:#e2c08d;font-size:24px;';
                
                const msgSpan = document.createElement('span');
                msgSpan.textContent = message;
                
                content.appendChild(iconInfo);
                content.appendChild(msgSpan);
                
                const actions = document.createElement('div');
                actions.style.cssText = 'padding:10px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid #2d2d2d;';
                
                const confirmBtn = document.createElement('button');
                confirmBtn.textContent = confirmText;
                confirmBtn.style.cssText = 'background:#007fd4;color:white;border:none;padding:5px 14px;border-radius:2px;cursor:pointer;font-size:13px;';
                confirmBtn.onmouseenter = () => confirmBtn.style.background = '#006eb5';
                confirmBtn.onmouseleave = () => confirmBtn.style.background = '#007fd4';
                confirmBtn.onclick = () => {
                    document.body.removeChild(overlay);
                    resolve(true);
                };

                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'Cancel';
                cancelBtn.style.cssText = 'background:#3c3c3c;color:white;border:none;padding:5px 14px;border-radius:2px;cursor:pointer;font-size:13px;';
                cancelBtn.onmouseenter = () => cancelBtn.style.background = '#4d4d4d';
                cancelBtn.onmouseleave = () => cancelBtn.style.background = '#3c3c3c';
                cancelBtn.onclick = () => {
                    document.body.removeChild(overlay);
                    resolve(false);
                };
                
                actions.appendChild(confirmBtn);
                actions.appendChild(cancelBtn);
                
                dialog.appendChild(content);
                dialog.appendChild(actions);
                overlay.appendChild(dialog);
                document.body.appendChild(overlay);

                // Quick blur fix for editor if desired
            });
        }

        document.getElementById('menu-delete').onclick = (e) => {
            if (activeKeyForMenu) {
                showVscConfirm('Are you sure you want to delete \'' + examples[activeKeyForMenu].name + '\'?', 'Delete').then((confirmed) => {
                    if (confirmed) {
                        delete examples[activeKeyForMenu];
                        saveExamples();
                        renderList();
                        if (Object.keys(examples).length > 0) {
                            loadExample(Object.keys(examples)[0]);
                        } else {
                            activeFileKey = null;
                            if (editor) editor.setValue('');
                            const editorTabs = document.querySelectorAll('.editor-tab');
                            if (editorTabs[0]) editorTabs[0].innerHTML = `<span class="material-icons-round" style="color: #4B8BBE;">code</span> Untitled`;
                        }
                    }
                });
            }
        };

        const list = document.getElementById('example-list');
        
        function renderList() {
            list.innerHTML = '';
            for (const [key, val] of Object.entries(examples)) {
                const li = document.createElement('li');
                li.id = 'file-item-' + key;
                
                const span = document.createElement('span');
                span.className = 'filename';
                span.style.flexGrow = 1;
                span.style.whiteSpace = 'nowrap';
                span.style.overflow = 'hidden';
                span.style.textOverflow = 'ellipsis';
                span.innerText = val.name;
                
                li.innerHTML = liTemplate;
                li.appendChild(span);
                
                li.onclick = (e) => {
                    // prevent open if clicking input
                    if (e.target.tagName.toLowerCase() === 'input') return;
                    loadExample(key, li);
                };
                
                li.ondblclick = (e) => {
                    e.stopPropagation();
                    if (e.target.tagName.toLowerCase() === 'input') return;
                    startRename(key);
                };
                
                li.oncontextmenu = (e) => {
                    e.preventDefault();
                    if (e.target.tagName.toLowerCase() === 'input') return;
                    activeKeyForMenu = key;
                    const menu = document.getElementById('context-menu');
                    menu.style.display = 'block';
                    menu.style.left = e.pageX + 'px';
                    menu.style.top = e.pageY + 'px';
                };
                
                list.appendChild(li);
            }
        }
        
        function startRename(key) {
            const li = document.getElementById('file-item-' + key);
            if (!li) return;
            const span = li.querySelector('.filename');
            if (!span) return;
            
            const currentName = examples[key].name;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'file-input-rename';
            input.value = currentName;
            
            let isCommitted = false;
            
            const commitRename = () => {
                if (isCommitted) return;
                isCommitted = true;
                const newName = input.value.trim();
                if (newName && newName !== currentName) {
                    examples[key].name = newName;
                    saveExamples();
                }
                renderList();
                loadExample(key, document.getElementById('file-item-' + key)); // reload to update UI
            };
            
            input.onblur = commitRename;
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    commitRename();
                } else if (e.key === 'Escape') {
                    isCommitted = true;
                    renderList(); // abort
                }
            };
            
            li.replaceChild(input, span);
            input.focus();
            input.select();
        }

        renderList();

        function switchPanelTab(tabId) {
            document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            document.querySelectorAll('.panel-content-inner').forEach(t => t.classList.remove('active'));
            document.getElementById('tab-' + tabId).classList.add('active');
        }

        function updatePanelContent(tabId, html) { document.getElementById('tab-' + tabId).innerHTML = html; }
        function clearPanel() { document.querySelectorAll('.panel-content-inner').forEach(t => t.innerHTML = ''); }
        function togglePanel() {
            const panel = document.getElementById('bottom-panel');
            const panelContent = document.getElementById('panel-content');
            const resizer = document.getElementById('panel-resizer');
            const isCollapsed = panelContent.style.display === 'none';

            if (isCollapsed) {
                // Restore to a reasonable height when expanding
                panel.style.height = panel.getAttribute('data-last-height') || '300px';
                panelContent.style.display = 'block';
                resizer.style.display = 'block';
            } else {
                // Collapse and save current height
                panel.setAttribute('data-last-height', panel.style.height);
                panel.style.height = '40px';
                panelContent.style.display = 'none';
                resizer.style.display = 'none';
            }
            
            setTimeout(() => {
                if (window.editor) {
                    window.editor.layout();
                }
            }, 50);
        }

        async function compileCode() {
            document.getElementById('compilation-status').innerText = "Compiling...";
            updatePanelContent('output', '<div style="color:var(--vsc-accent); display:flex; align-items:center; gap:8px;"><span class="material-icons-round" style="animation: spin 1s linear infinite;">sync</span> Running Pipeline...</div>');
            try {
                const response = await fetch('/compile', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: editor.getValue() })
                });
                const result = await response.json();
                
                if (result.error) {
                    updatePanelContent('tokens', `<div style="background:rgba(244,135,113,0.1); border-left:4px solid #f48771; padding:15px; border-radius:4px; font-family:'Segoe UI', sans-serif;">
                        <div style="color:#f48771; font-weight:bold; font-size:16px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                            <span class="material-icons-round">error_outline</span> ${result.error}
                        </div>
                        <div style="color:var(--vsc-text); opacity:0.9; margin-left:26px; white-space:pre-wrap;">${result.details.join('<br>')}</div>
                    </div>`);
                    document.getElementById('compilation-status').innerText = "Error";
                } else {
                    document.getElementById('compilation-status').innerText = "Success";
                    
                    // Graphical Tokens UI
                    let tHtml = `<div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; text-align:left; color:var(--vsc-text); font-family:Consolas, monospace; font-size:13px; min-width:400px;">
                        <thead>
                            <tr style="border-bottom:1px solid var(--vsc-border); color:var(--vsc-sidebar-header); font-family:'Segoe UI', sans-serif; font-size:12px; text-transform:uppercase;">
                                <th style="padding:10px 15px; width:60px;">Line</th>
                                <th style="padding:10px 15px; width:150px;">Token Type</th>
                                <th style="padding:10px 15px;">Lexeme Value</th>
                            </tr>
                        </thead>
                        <tbody>`;
                    
                    result.tokens.forEach(t => {
                        let typeColor = "#569cd6";
                        let bgAlpha = "0.1";
                        if (t.type === "IDENTIFIER") typeColor = "#9cdcfe";
                        else if (t.type === "NUMBER") { typeColor = "#b5cea8"; bgAlpha = "0.15"; }
                        else if (t.type === "STRING") { typeColor = "#ce9178"; bgAlpha = "0.15"; }
                        else if (t.type === "OPERATOR" || t.type === "PUNCTUATION") typeColor = "#d4d4d4";
                        else if (t.type === "KEYWORD") typeColor = "#c586c0";

                        tHtml += `<tr style="border-bottom:1px solid rgba(128,128,128,0.1); transition:background 0.2s;" onmouseover="this.style.background='var(--vsc-highlight)'" onmouseout="this.style.background='transparent'">
                            <td style="padding:8px 15px; color:#858585;">${t.line}</td>
                            <td style="padding:8px 15px;">
                                <span style="background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:4px; color:${typeColor}; border:1px solid rgba(255,255,255,0.1); font-size:12px;">${t.type}</span>
                            </td>
                            <td style="padding:8px 15px; color:#ce9178; font-weight:bold; letter-spacing:0.5px;">${t.value || " "}</td>
                        </tr>`;
                    });
                    tHtml += `</tbody></table></div>`;
                    updatePanelContent('tokens', tHtml);
                    
                    updatePanelContent('ast', `<div style="padding:10px 15px; background:var(--vsc-editor-bg); border-radius:4px; border:1px solid var(--vsc-border); overflow-x:auto;"><ul class="tree">${buildTreeHtml(result.ast)}</ul></div>`);
                    
                    updatePanelContent('semantic', `<div style="display:flex; align-items:center; gap:12px; padding:15px 20px; background:rgba(39, 201, 63, 0.08); border-left:4px solid #27c93f; border-radius:4px; font-family:'Segoe UI', sans-serif;">
                        <span class="material-icons-round" style="color:#27c93f; font-size:28px;">verified</span>
                        <div>
                            <div style="color:#27c93f; font-weight:600; font-size:15px; margin-bottom:2px;">Semantic Analysis OK</div>
                            <div style="color:var(--vsc-text); opacity:0.8; font-size:13px; font-family:Consolas, monospace;">${result.semantic.replace('Γ£ô', '').trim()}</div>
                        </div>
                    </div>`);
                    
                    // Graphical IR
                    const irHtml = result.ir.map((inst, index) => {
                        let parts = inst.split(' ');
                        const op = parts[0];
                        const args = parts.slice(1).join(' ')
                            .replace(/(_\d+|t\d+)/g, '<span style="color:#4fc1ff;">$1</span>')
                            .replace(/\b(\d+)\b/g, '<span style="color:#b5cea8;">$1</span>');
                        return `<div style="display:flex; align-items:center; gap:15px; padding:4px 10px; font-family:Consolas, monospace; border-bottom:1px dashed rgba(128,128,128,0.1); cursor:default;" onmouseover="this.style.background='var(--vsc-highlight)'" onmouseout="this.style.background='transparent'">
                            <span style="color:#858585; width:24px; text-align:right; font-size:11px; opacity:0.7;">${("0"+(index+1)).slice(-2)}</span>
                            <span style="color:#c586c0; font-weight:bold; width:80px; text-transform:uppercase;">${op}</span>
                            <span style="color:#9cdcfe;">${args}</span>
                        </div>`;
                    }).join('');
                    updatePanelContent('ir', `<div style="background:var(--vsc-editor-bg); border:1px solid var(--vsc-border); border-radius:4px; padding:10px 0; overflow-x:auto;">${irHtml || '<div style="padding:0 20px; color:#858585;">No Instructions</div>'}</div>`);
                    
                    // Assembly with syntax highlight
                    const asmHtml = result.assembly.split('\n').map(line => {
                        let isLabel = line.trim().endsWith(':');
                        let content = line;
                        let comment = '';
                        if (line.includes(';')) {
                            let parts = line.split(';');
                            content = parts[0];
                            comment = `;${parts[1]}`;
                        }
                        
                        if (!isLabel) {
                            content = content
                                .replace(/\b(mov|add|sub|jmp|je|jne|cmp|call|ret|push|pop|imul|idiv|lea)\b/gi, '<span style="color:#c586c0; font-weight:bold;">$1</span>')
                                .replace(/\b(eax|ebx|ecx|edx|esp|ebp|edi|esi|al|ah|bl|bh|cl|ch|dl|dh)\b/gi, '<span style="color:#9cdcfe;">$1</span>')
                                .replace(/\b(\d+)\b/g, '<span style="color:#b5cea8;">$1</span>');
                        }

                        let color = isLabel ? '#dcdcaa' : 'var(--vsc-text)';
                        let marginLeft = isLabel ? '10px' : '40px';
                        let htmlPart = `<span style="color:${color}; font-weight:${isLabel ? 'bold' : 'normal'};">${content}</span>`;
                        if (comment) htmlPart += `<span style="color:#6a9955; margin-left:20px; font-style:italic;">${comment}</span>`;
                        
                        return `<div style="margin-left:${marginLeft}; padding:2px 10px; font-family:Consolas, monospace; cursor:default; border-radius:2px;" onmouseover="this.style.background='var(--vsc-highlight)'" onmouseout="this.style.background='transparent'">${htmlPart}</div>`;
                    }).join('');
                    updatePanelContent('assembly', `<div style="background:var(--vsc-editor-bg); border:1px solid var(--vsc-border); border-radius:4px; padding:15px 0; white-space:pre-wrap; overflow-x:auto;">${asmHtml}</div>`);
                    
                    updatePanelContent('output', `<div style="display:flex; align-items:center; gap:8px; padding:10px; background:rgba(39, 201, 63, 0.05); color:#89d185; border:1px solid rgba(39, 201, 63, 0.2); border-radius:4px; font-family:'Segoe UI', sans-serif;">
                        <span class="material-icons-round">task_alt</span> Pipeline finished successfully.
                    </div>`);
                }
            } catch (err) {
                updatePanelContent('output', `<div style="color:#f48771; display:flex; align-items:center; gap:8px;"><span class="material-icons-round">error</span> Failed: ${err.message}</div>`);
            }
        }

        function buildTreeHtml(node) {
            if (!node) return '';
            let isLeaf = !node.children || node.children.length === 0;
            let icon = isLeaf ? 'description' : 'folder_open';
            let iconColor = isLeaf ? '#519aba' : '#dcb67a';
            
            let html = `<li style="padding: 2px 0;">
                <div style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;" onmouseover="this.style.background='var(--vsc-highlight)'; this.style.borderRadius='4px'; this.style.paddingRight='8px'" onmouseout="this.style.background='transparent'">
                    <span class="material-icons-round" style="font-size:16px; color:${iconColor};">${icon}</span>
                    <span style="color:var(--vsc-text); font-weight:${isLeaf ? 'normal' : '600'}; font-size:13px;">${node.name}</span>
                </div>`;
                
            if (node.children?.length > 0) {
                html += '<ul class="tree" style="margin-top:2px;">';
                for (let child of node.children) {
                    html += buildTreeHtml(child);
                }
                html += '</ul>';
            }
            html += '</li>';
            return html;
        }

        // Service Worker Registration for PWA
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('ServiceWorker registered:', registration.scope))
                    .catch(err => console.error('ServiceWorker registration failed:', err));
            });
        }

        // Handle PWA Installation on Mobile/Desktop
        let deferredPrompt;
        const installBtn = document.getElementById('install-pwa-btn');

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            deferredPrompt = e;
            // Update UI notify the user they can install the PWA
            if(installBtn) installBtn.style.display = 'flex';
        });

        if(installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    // Show the install prompt
                    deferredPrompt.prompt();
                    // Wait for the user to respond to the prompt
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);
                    // We've used the prompt, and can't use it again, throw it away
                    deferredPrompt = null;
                    installBtn.style.display = 'none';
                }
            });
        }

        window.addEventListener('appinstalled', () => {
            // Hide the app-provided install promotion
            if(installBtn) installBtn.style.display = 'none';
            deferredPrompt = null;
            console.log('PWA was installed successfully');
        });
