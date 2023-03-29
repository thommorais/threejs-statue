class MobileDebugOverlay {

    constructor() {

        this.has = true;

        this.debug = document.createElement('div');

        this.debug.classList.add('debug')

        Object.assign(this.debug.style, {
            position: 'fixed',
            right: '0',
            bottom: '0',
            width: '100vw',
            zIndex: '100',
            padding: '1rem',
            background: 'rgba(0,0,0,0.5)',
            pointerEvents: 'none',
        })

        document.body.appendChild(this.debug);

    }

    clearAll() {
        this.debug.innerHTML = '';
    }

    generateClassName() {
        return Math.random().toString(36).substr(2, 9);
    }

    addContent(content) {
        const className = this.generateClassName();
        const element = document.createElement('div');
        element.classList.add(className);
        element.innerHTML = content;
        this.debug.insertAdjacentElement('beforeend', element);
        return className;
    }

    removeGivenElement(element) {
        this.debug.parentNode.removeChild(element);
    }

    removeElementByClassName(className) {
        const element = document.querySelector(`.${className}`);
        this.debug.parentNode.removeChild(element);
    }

}

export default MobileDebugOverlay;