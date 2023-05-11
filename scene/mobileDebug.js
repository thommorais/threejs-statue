
import { now } from './utils';

class MobileDebugOverlay {

    constructor(store) {

        this.store = store;

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

        const modelLoading = this.addContent(`<div>model loading: ${0}</div>`)
        const loader = document.body.querySelector(`.${modelLoading}`);
        this.store.subscribe(({ modelLoadingProgress }) => {
            if (loader) {
                loader.innerHTML = `<div>model loading: ${modelLoadingProgress}</div>`
            }
        }, 'modelLoadingProgress')

    }

    clearAll() {
        this.debug.innerHTML = '';
    }

    updateContent(className, content) {
        const element = document.querySelector(`.${className}`);
        if (element) {
            element.innerHTML = content;
        }
    }

    generateClassName() {
        return `deb-${now()}-ug-${Math.random()}`.replace('.', '-')
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