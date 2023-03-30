import { MeshStandardMaterial } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function getModel(modelPath, store, manager) {
    return new Promise((resolve, reject) => {
        try {

            window.mobileDebug.addContent(`<div>trying to load model</div>`);


            const dracoLoader = new DRACOLoader();
            const loader = new GLTFLoader(manager);

            dracoLoader.setDecoderPath('/draco/');
            dracoLoader.preload();
            loader.setDRACOLoader(dracoLoader);

            if (!modelPath) {
                reject(new Error('modelPath is required'));
            }

            const boxMaterial = new MeshStandardMaterial({
                roughness: 0.455,
                metalness: 0.475,
            });


            loader.load(
                modelPath,
                ({ scene }) => {

                    const box = scene;

                    try {

                        box.name = 'character-model';

                        box.traverse((child) => {
                            if (child.isMesh) {
                                // eslint-disable-next-line no-param-reassign
                                child.material = boxMaterial;
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }

                    store.setState({ modelLoadingProgress: 100 });
                    resolve(box);
                },
                // called while loading is progressing
                ({ total, loaded }) => {
                    if (total > 0) {
                        store.setState({ modelLoadingProgress: Math.round((loaded / total) * 100) });
                    }
                },
                (error) => {
                    store.setState({ modelLoadingProgress: 0, modelError: error });
                    reject(error);
                },
            );
        } catch (error) {
            reject(error);
        }

    });
}

export default getModel;
