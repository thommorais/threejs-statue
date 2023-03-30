import { MeshStandardMaterial } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function getModel(modelPath, store) {
    return new Promise((resolve, reject) => {
        try {

            const dracoLoader = new DRACOLoader();
            const loader = new GLTFLoader();

            dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
            dracoLoader.preload();
            loader.setDRACOLoader(dracoLoader);

            if (!modelPath) {
                reject(new Error('modelPath is required'));
            }


            const onProgress = (xhr) => {
                if (xhr.lengthComputable) {
                    const percentComplete = xhr.loaded / xhr.total * 100;
                    const roundedPercent = Math.round(percentComplete);
                    if (roundedPercent % 10 === 0) {
                        store.setState({ modelLoadingProgress: Number((roundedPercent).toFixed(2)) });
                    }
                }
            }


            loader.loadAsync(modelPath, onProgress).then(({ scene }) => {

                window.mobileDebug.addContent(`<div>model loaded: ${modelPath}</div>`);

                const box = scene;

                const boxMaterial = new MeshStandardMaterial({
                    roughness: 0.455,
                    metalness: 0.475,
                });

                box.traverse((child) => {
                    if (child.isMesh) {
                        // eslint-disable-next-line no-param-reassign
                        child.material = boxMaterial;
                    }
                });

                const { modelLoadingProgress } = store.getState();

                if (modelLoadingProgress < 100) {
                    store.setState({ modelLoadingProgress: 100 });
                }
                resolve(box);
            }).catch((error) => {
                window.mobileDebug.addContent(`<div>model error: ${error}</div>`);
                store.setState({ modelLoadingProgress: 0, modelError: error });
                reject(error);
            })

        } catch (error) {
            reject(error);
        }

    });
}

export default getModel;
