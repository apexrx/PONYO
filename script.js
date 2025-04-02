document.addEventListener('DOMContentLoaded', () => {
    const editorInput = document.getElementById('mermaid-input');
    const viewerOutput = document.getElementById('mermaid-output');
    const errorOutput = document.getElementById('error-output');
    const resizer = document.getElementById('dragMe');
    const editorPane = document.querySelector('.editor-pane');
    const viewerPane = document.querySelector('.viewer-pane');
    const themeSelector = document.getElementById('theme-selector');

    // --- Define Theme Variables ---
    const themes = {
        classic: { // US Graphics Inspired - Enhanced
            theme: 'base', // Use 'base' for more control over specifics
            themeVariables: {
                // Core Look
                background: '#FFFFFF',        // White background
                primaryColor: '#F5F5F5',        // Light grey nodes (slightly off-white)
                primaryTextColor: '#231F20',    // Black text
                primaryBorderColor: '#A9A9A9',  // Dark Grey border
                lineColor: '#696969',        // Dim Grey lines/arrows
                textColor: '#231F20',        // Default text color

                // Node Styling
                nodeBorder: '#A9A9A9',        // Default node border
                nodeTextColor: '#231F20',

                // US Graphics Accent Colors (Subtle Application)
                secondaryColor: '#E0EFFF',      // Light Blue background for secondary/alternative nodes
                secondaryTextColor: '#231F20',
                secondaryBorderColor: '#0072CE', // US Graphics Blue border for secondary nodes

                tertiaryColor: '#E6F6E8',      // Very Light Green background for tertiary nodes/states
                tertiaryTextColor: '#231F20',
                tertiaryBorderColor: '#00A651',   // US Graphics Green border

                // Specific Diagram Elements
                actorBkg: '#E0EFFF',        // Light Blue background for sequence diagram actors
                actorBorder: '#0072CE',      // US Graphics Blue border for actors
                actorTextColor: '#231F20',
                labelBoxBkgColor: '#FFF8D4',    // Light Yellow background for labels (inspired by USG Yellow)
                labelTextColor: '#231F20',
                labelBorderColor: '#FFB700',     // US Graphics Yellow border for labels

                signalColor: '#231F20',       // Sequence diagram signal text
                signalTextColor: '#231F20',

                classText: '#231F20',        // Class diagram text

                // Gantt Chart Specifics
                taskBorderColor: '#0072CE',    // Blue border for tasks
                taskTextColor: '#231F20',
                taskBkgColor: '#F5F5F5',       // Default task background (match primary)
                taskBkgDarkColor: '#E0EFFF',   // Alt task background (Light blue)
                doneTaskBkgColor: '#DFF0D8',   // Light Green background for completed tasks (inspired by USG Green)
                doneTaskBorderColor: '#00A651', // USG Green border
                critBkgColor: '#FFE0E1',      // Light Red background for critical tasks (inspired by USG Red)
                critBorderColor: '#ED1C24',    // USG Red border for critical tasks
                activeTaskBkgColor: '#FFF8D4', // Light Yellow for active tasks
                activeTaskBorderColor: '#FFB700', // USG Yellow border

                // Font Setting (Attempt)
                 fontFamily: '"JetBrains Mono", monospace', // ** Attempt to set diagram font **
                 fontSize: '14px', // Keep font size consistent

                 // Other potential variables (defaults usually fine)
                 // clusterBkg: '#F0F0F0',
                 // clusterBorder: '#A9A9A9',
                 // noteBkgColor: '#FFFACD', // Lemon Chiffon like notes
                 // noteTextColor: '#333',
                 // noteBorderColor: '#AAAAAA',
            }
        },
        // --- Other Themes Remain ---
        catppuccin: { /* ...as before... */
            theme: 'base',
             themeVariables: {
                background: '#1E1E2E', primaryColor: '#FAB387', secondaryColor: '#89B4FA', tertiaryColor: '#A6E3A1',
                primaryTextColor: '#CDD6F4', secondaryTextColor: '#BAC2DE', tertiaryTextColor: '#A6ADC8', primaryBorderColor: '#F5C2E7',
                lineColor: '#585B70', textColor: '#CDD6F4', nodeBorder: '#F5C2E7', clusterBkg: '#313244', clusterBorder: '#74C7EC',
                 fontFamily: '"Inter", sans-serif',
            }
        },
        dracula: { /* ...as before... */
            theme: 'dark',
            themeVariables: {
                background: '#282a36', primaryColor: '#6272a4', secondaryColor: '#44475a', primaryTextColor: '#f8f8f2',
                lineColor: '#6272a4', textColor: '#f8f8f2', nodeBorder: '#ff79c6', clusterBkg: '#44475a', clusterBorder: '#bd93f9',
                primaryBorderColor: '#ff79c6',
                 fontFamily: '"Inter", sans-serif',
            }
        },
        rosepine: { /* ...as before... */
            theme: 'base',
             themeVariables: {
                background: '#191724', primaryColor: '#eb6f92', secondaryColor: '#31748f', tertiaryColor: '#9ccfd8',
                primaryTextColor: '#e0def4', secondaryTextColor: '#908caa', primaryBorderColor: '#ebbcba', lineColor: '#555169',
                textColor: '#e0def4', nodeBorder: '#ebbcba', clusterBkg: '#26233a', clusterBorder: '#c4a7e7',
                 fontFamily: '"Inter", sans-serif',
            }
        },
        materialyou: { /* ...as before... */
             theme: 'base',
             themeVariables: {
                background: '#F7F9FF', primaryColor: '#D3E3FD', primaryTextColor: '#001D36', secondaryColor: '#E8DEF8',
                secondaryTextColor: '#1D192B', tertiaryColor: '#D2E6D2', tertiaryTextColor: '#0F1F12', lineColor: '#73777F',
                textColor: '#1A1C1E', nodeBorder: '#73777F', clusterBkg: '#EADDFF', clusterBorder: '#79747E',
                primaryBorderColor: '#0B57D0',
                 fontFamily: '"Inter", sans-serif', nodeBorderRadius: 4,
            }
        },
        // --- Built-in Mermaid Themes (adjusted font) ---
        dark: { theme: 'dark', themeVariables: { fontFamily: '"Inter", sans-serif'} },
        forest: { theme: 'forest', themeVariables: { fontFamily: '"Inter", sans-serif'} },
    };

    let currentThemeConfig = themes.classic; // Default to classic

    // --- Mermaid Initialization Function ---
    const initializeMermaid = () => {
        try {
            // Remove any existing config before re-initializing
             if (mermaid.mermaidAPI && mermaid.mermaidAPI.initialize && mermaid.mermaidAPI.initialize.config) {
                 delete mermaid.mermaidAPI.initialize.config;
             }

             // Determine the font family to apply
             const baseFont = currentThemeConfig.theme === 'classic'
                 ? '"JetBrains Mono", monospace' // Force JetBrains Mono for Classic theme diagrams
                 : currentThemeConfig.themeVariables?.fontFamily || '"Inter", sans-serif'; // Use theme font or fallback to Inter

             const configToApply = {
                 startOnLoad: false,
                 ...currentThemeConfig, // Spread the selected theme config base
                 // Override themeVariables specifically if needed (though spreading usually works)
                  themeVariables: {
                      ...(currentThemeConfig.themeVariables || {}), // Keep existing vars
                      fontFamily: baseFont, // Ensure our calculated font is applied
                  },
                 securityLevel: 'loose',
                 // Font family is now primarily controlled via themeVariables for consistency
                 flowchart: {
                     htmlLabels: true
                 }
                 // Note: Gantt charts, Class diagrams might have their own font settings that can override this
             };

             mermaid.initialize(configToApply);
             console.log("Mermaid initialized with theme:", themeSelector.value, "Font attempted:", baseFont);

        } catch (e) {
            console.error("Error initializing mermaid:", e);
        }
    };


    // --- Debounce Function (Unchanged) ---
    function debounce(func, wait) { /* ... */
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- Render Function (Ensure re-init happens) ---
    const renderMermaid = async () => {
        const mermaidCode = editorInput.value.trim();
        errorOutput.textContent = '';
        errorOutput.style.display = 'none';
        viewerOutput.innerHTML = '<p class="placeholder-text">Rendering...</p>';

        if (!mermaidCode) {
            viewerOutput.innerHTML = '<p class="placeholder-text">Diagram will appear here</p>';
            viewerOutput.style.backgroundColor = themes.classic.themeVariables.background; // Reset background to default
            return;
        }

        try {
             // Re-initialize Mermaid with the current theme settings before each render
             initializeMermaid();

             const uniqueId = 'mermaid-graph-' + Date.now();
             const { svg, bindFunctions } = await mermaid.render(uniqueId, mermaidCode);
             viewerOutput.innerHTML = svg;

             // Set viewer background based on theme's background variable
            viewerOutput.style.backgroundColor = currentThemeConfig.themeVariables?.background || '#FFFFFF';

            if (bindFunctions) {
                bindFunctions(viewerOutput);
            }
        } catch (error) {
             // Error handling remains the same
            console.error("Mermaid rendering error:", error);
            viewerOutput.innerHTML = '<p class="placeholder-text">Error rendering diagram</p>';
            viewerOutput.style.backgroundColor = '#FFFFFF'; // Reset background on error
            let errorMessage = `Error: ${error.message || error.str || 'Unknown error'}`;
             const lineMatch = String(error.message || error.str || '').match(/line: (\d+)/);
             if (lineMatch && lineMatch[1]) {
                 errorMessage += ` (Check near line ${lineMatch[1]})`;
             }
            errorOutput.textContent = errorMessage;
            errorOutput.style.display = 'block';
        }
    };

    // --- Event Listeners (Theme selector logic updated) ---
    const debouncedRender = debounce(renderMermaid, 500);
    editorInput.addEventListener('input', debouncedRender);

    // Theme Selector Change Listener
    themeSelector.addEventListener('change', (e) => {
        const selectedThemeKey = e.target.value;
        currentThemeConfig = themes[selectedThemeKey] || themes.classic; // Fallback to classic
        console.log(`Theme changed to: ${selectedThemeKey}`);
        renderMermaid(); // Re-render with the new theme
    });

    // --- Resizer Logic (Unchanged) ---
    /* ... Resizer code remains the same ... */
    let isResizing = false;
    let startX, initialEditorWidth, initialViewerWidth;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        initialEditorWidth = editorPane.offsetWidth;
        initialViewerWidth = viewerPane.offsetWidth;
        document.body.style.cursor = 'ew-resize';
        editorPane.style.userSelect = 'none';
        viewerPane.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    });

    function handleMouseMove(e) {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const totalWidth = editorPane.parentElement.offsetWidth - resizer.offsetWidth;
        const minWidth = 50;
        let newEditorWidth = initialEditorWidth + dx;
        let newViewerWidth = initialViewerWidth - dx;

        if (newEditorWidth < minWidth) {
            newEditorWidth = minWidth;
            newViewerWidth = totalWidth - minWidth;
        } else if (newViewerWidth < minWidth) {
            newViewerWidth = minWidth;
            newEditorWidth = totalWidth - minWidth;
        }
        editorPane.style.flexBasis = `${(newEditorWidth / totalWidth) * 100}%`;
        viewerPane.style.flexBasis = `${(newViewerWidth / totalWidth) * 100}%`;
    }

    function handleMouseUp() {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            editorPane.style.userSelect = '';
            viewerPane.style.userSelect = '';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    }


    // --- Save Functionality (Unchanged) ---
    /* ... Save button logic remains the same ... */
    const downloadSvgButton = document.getElementById('download-svg');
    const downloadPngButton = document.getElementById('download-png');
    const copyMarkdownButton = document.getElementById('copy-markdown');
    const copyHtmlButton = document.getElementById('copy-html');
    const saveOptions = document.getElementById('save-options'); // Dropdown container

     const hideSaveOptions = () => {
         const dropdown = document.querySelector('.save-container .save-options-dropdown');
         if (dropdown) {
             setTimeout(() => { dropdown.style.display = 'none'; }, 50);
             const saveContainer = document.querySelector('.save-container');
              if(saveContainer) {
                 saveContainer.style.pointerEvents = 'none';
                 setTimeout(() => {saveContainer.style.pointerEvents = ''; }, 100);
             }
         }
     };

    downloadSvgButton.addEventListener('click', (e) => {
        e.preventDefault();
        const svgContent = viewerOutput.querySelector('svg');
        if (!svgContent) { alert('No diagram rendered to save.'); return; }
        svgContent.style.backgroundColor = viewerOutput.style.backgroundColor || '#FFFFFF';
        const svgData = new XMLSerializer().serializeToString(svgContent);
        svgContent.style.backgroundColor = '';

        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagram.svg';
        link.click();
        URL.revokeObjectURL(url);
        hideSaveOptions();
    });

    downloadPngButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const svgElement = viewerOutput.querySelector('svg');
        if (!svgElement) { alert('No diagram rendered to save.'); return; }

        if (typeof svgToPngConverter === 'undefined') {
             alert('PNG conversion library (svg-to-png-converter) not loaded correctly.');
             console.error('svgToPngConverter is not defined.');
             hideSaveOptions();
             return;
         }

        try {
            const options = {
                 backgroundColor: viewerOutput.style.backgroundColor || '#FFFFFF',
                 scale: 2
            };
            const dataUrl = await svgToPngConverter.svgElementToPngDataUrl(svgElement, options);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'diagram.png';
            link.click();
        } catch (error) {
             console.error('Error converting SVG to PNG:', error);
             alert(`Failed to convert diagram to PNG. ${error.message || ''}. See console for details.`);
        }
        hideSaveOptions();
    });

    copyMarkdownButton.addEventListener('click', (e) => {
        e.preventDefault();
        const code = editorInput.value;
        const markdown = "```mermaid\n" + code + "\n```";
        navigator.clipboard.writeText(markdown).then(() => {
            const originalText = copyMarkdownButton.textContent;
            copyMarkdownButton.textContent = 'Copied!';
            setTimeout(() => { copyMarkdownButton.textContent = originalText; }, 1500);
        }).catch(err => {
            console.error('Failed to copy Markdown: ', err);
            alert('Failed to copy Markdown.');
        });
        hideSaveOptions();
    });

    copyHtmlButton.addEventListener('click', (e) => {
        e.preventDefault();
        const svgContent = viewerOutput.innerHTML;
         if (!viewerOutput.querySelector('svg')) { alert('No diagram rendered to copy.'); return; }
        navigator.clipboard.writeText(svgContent).then(() => {
            const originalText = copyHtmlButton.textContent;
            copyHtmlButton.textContent = 'Copied!';
            setTimeout(() => { copyHtmlButton.textContent = originalText; }, 1500);
        }).catch(err => {
            console.error('Failed to copy HTML: ', err);
            alert('Failed to copy HTML.');
        });
        hideSaveOptions();
    });


    // --- Example Loading (Unchanged) ---
    /* ... Examples object and loading logic remains the same ... */
    const examples = {
        'example-flowchart': `graph TD
    A[Standard Node] --> B{Decision?};
    B -- Yes --> C[/Result/];
    C --> F(End);
    B -- No --> D((Alternative));
    D --> E[Action];
    E --> F;`,
       'example-sequence': `sequenceDiagram
    actor User
    participant Frontend
    participant Backend as API
    User->>Frontend: Request Data
    activate Frontend
    Frontend->>API: GET /data
    activate API
    API-->>Frontend: Data Payload
    deactivate API
    Frontend-->>User: Display Data
    deactivate Frontend`,
       'example-gantt': `gantt
    dateFormat  YYYY-MM-DD
    title Project Timeline
    excludes    weekends

    section Planning
    Requirements    :done,    req, 2024-03-01, 7d
    Design Spec     :active,  des, after req, 5d
     Prototype       :         proto, after des, 5d

    section Development
    Feature A       :crit, done, fta, after proto, 10d
    Feature B       :crit, active, ftb, after fta, 7d
    Testing         :crit,       test, after ftb, 5d
    Deployment      :            dep, after test, 3d`,
       'example-class': `classDiagram
    direction LR
    class System {
      +DataProcessor processor
      +Logger logger
      +run() void
    }
    class DataProcessor {
      -dataSource : String
      +process(data: object) Result
      +validate(data: object) bool
    }
    class Logger {
      +logInfo(message: string) void
      +logError(message: string, error: Error) void
    }
    class Result {
      +status: String
      +output: object
    }
    System "1" *-- "1" DataProcessor : uses
    System "1" *-- "1" Logger : uses
    DataProcessor ..> Result : creates`
   };

   Object.keys(examples).forEach(id => {
       const link = document.getElementById(id);
       if (link) {
           link.addEventListener('click', (e) => {
               e.preventDefault();
               editorInput.value = examples[id];
               renderMermaid(); // Render immediately
                const dropdownContent = link.closest('.dropdown-content');
                if (dropdownContent) {
                      setTimeout(() => { dropdownContent.style.display = 'none'; }, 50);
                       setTimeout(() => { dropdownContent.style.display = ''; }, 200);
                }
           });
       }
   });


    // --- About Modal Logic (Unchanged) ---
    /* ... About modal logic remains the same ... */
    const aboutModal = document.getElementById('about-modal');
    const aboutLink = document.getElementById('about-link');
    const closeButton = document.querySelector('.modal .close-button');

    aboutLink.addEventListener('click', (e) => { e.preventDefault(); aboutModal.style.display = 'block'; });
    closeButton.addEventListener('click', () => { aboutModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target == aboutModal) { aboutModal.style.display = 'none'; } });


    // --- Initial Render ---
    editorInput.value = examples['example-flowchart']; // Load default example
    initializeMermaid(); // Initialize with default theme (Classic)
    renderMermaid(); // Render the default example

});
