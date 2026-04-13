// src/ui/resizer.ts
export class Resizer {
    resizerElement;
    targetElement;
    type;
    isResizing = false;
    constructor(resizerElement, targetElement, type) {
        this.resizerElement = resizerElement;
        this.targetElement = targetElement;
        this.type = type;
        if (this.resizerElement && this.targetElement) {
            this.init();
        }
        else {
            console.warn(`Elements for ${type} resizer not found`);
        }
    }
    init() {
        this.resizerElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.resizerElement.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    }
    doResize(clientX, clientY) {
        if (!this.targetElement)
            return;
        if (this.type === 'panel') {
            const containerRect = document.getElementById('editor-area')?.getBoundingClientRect();
            if (!containerRect)
                return;
            let newHeight = containerRect.bottom - clientY;
            newHeight = Math.max(40, Math.min(newHeight, containerRect.height - 100)); // Constrain limits
            this.targetElement.style.height = `${newHeight}px`;
        }
        else { // Sidebar
            if (window.innerWidth <= 768) {
                const activityBarRect = document.getElementById('activity-bar')?.getBoundingClientRect();
                if (!activityBarRect)
                    return;
                let newHeight = clientY - activityBarRect.bottom;
                newHeight = Math.max(50, Math.min(newHeight, window.innerHeight * 0.5));
                this.targetElement.style.height = `${newHeight}px`;
                this.targetElement.style.width = '100%';
            }
            else {
                const activityBar = document.getElementById('activity-bar');
                const activityBarWidth = activityBar ? activityBar.offsetWidth : 0;
                let newWidth = clientX - activityBarWidth;
                newWidth = Math.max(50, Math.min(newWidth, window.innerWidth * 0.6));
                this.targetElement.style.width = `${newWidth}px`;
                this.targetElement.style.height = 'auto';
            }
        }
        // Notify Monaco editor about the layout change
        if (window.editor) {
            window.editor.layout();
        }
    }
    onMouseDown(e) {
        e.preventDefault();
        this.startResize();
        this.resizerElement.style.cursor =
            (this.type === 'sidebar' && window.innerWidth <= 768) ? 'ns-resize' :
                (this.type === 'sidebar' ? 'ew-resize' : 'ns-resize');
        const onMouseMove = (moveEvent) => this.doResize(moveEvent.clientX, moveEvent.clientY);
        const onMouseUp = () => this.stopResize(onMouseMove, onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    onTouchStart(e) {
        this.startResize();
        const onTouchMove = (moveEvent) => {
            if (!this.isResizing)
                return;
            moveEvent.preventDefault();
            this.doResize(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
        };
        const onTouchEnd = () => this.stopResizeTouch(onTouchMove, onTouchEnd);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    }
    startResize() {
        this.isResizing = true;
        this.resizerElement.classList.add('resizing');
    }
    stopResize(moveListener, upListener) {
        this.isResizing = false;
        this.resizerElement.classList.remove('resizing');
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', moveListener);
        document.removeEventListener('mouseup', upListener);
    }
    stopResizeTouch(moveListener, upListener) {
        this.isResizing = false;
        this.resizerElement.classList.remove('resizing');
        document.removeEventListener('touchmove', moveListener);
        document.removeEventListener('touchend', upListener);
    }
}
//# sourceMappingURL=resizer.js.map