import { MeshStandardMaterial } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function getModel(modelPath, store) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    dracoLoader.preload();

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    return new Promise((resolve, reject) => {

        if (!modelPath) {
            reject(new Error('modelPath is required'));
        }

        loader.load(
            modelPath,
            (gltf) => {
                const boxMaterial = new MeshStandardMaterial({
                    roughness: 0.455,
                    metalness: 0.475,
                });
                const box = gltf.scene;

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

                resolve(box);
            },
            // called while loading is progressing
            (xhr) => {
                const modelLoadingProgress = Math.round((xhr.loaded / xhr.total) * 100);
                store.setState({ modelLoadingProgress });
            },
            (error) => reject(error),
        );
    });
}

export default getModel;