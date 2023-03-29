import { MeshStandardMaterial } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function getModel(modelPath, store, manager) {
    return new Promise((resolve, reject) => {

        const dracoLoader = new DRACOLoader();

        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        dracoLoader.preload();

        const loader = new GLTFLoader(manager);
        loader.setDRACOLoader(dracoLoader);


        if (!modelPath) {
            reject(new Error('modelPath is required'));
        }

        const boxMaterial = new MeshStandardMaterial({
            roughness: 0.455,
            metalness: 0.475,
        });

        try {
            loader.load(
                modelPath,
                ({ scene }) => {
                    const box = scene;

                    box.name = 'character-model';

                    box.traverse((child) => {
                        if (child.isMesh) {
                            // eslint-disable-next-line no-param-reassign
                            child.material = boxMaterial;
                        }
                        // eslint-disable-next-line no-param-reassign
                        child.castShadow = true;
                        // eslint-disable-next-line no-param-reassign
                        child.receiveShadow = true;


                    });

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
                    throw new Error('Error loading model:', error);
                },
            );
        } catch (error) {
            store.setState({ modelLoadingProgress: 0 });
            reject(error);
        }

    });
}

export default getModel;
