import { MeshStandardMaterial } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function getModel(modelPath, store) {
    return new Promise((resolve, reject) => {
        try {

            const dracoLoader = new DRACOLoader();
            const loader = new GLTFLoader();

            dracoLoader.setDecoderPath('/draco/');
            dracoLoader.preload();
            loader.setDRACOLoader(dracoLoader);

            if (!modelPath) {
                reject(new Error('modelPath is required'));
            }


            window.mobileDebug.addContent(`<div>trying to load model: ${modelPath}</div>`);

            loader.loadAsync(modelPath).then(({ scene }) => {
                const box = scene;
                box.name = 'character-model';

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

                store.setState({ modelLoadingProgress: 100 });
                resolve(box);
            }).catch((error) => {
                store.setState({ modelLoadingProgress: 0, modelError: error });
                reject(error);
            })

        } catch (error) {
            reject(error);
        }

    });
}

export default getModel;
