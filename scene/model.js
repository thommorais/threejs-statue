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

                store.setState({ modelLoadingProgress:100 });
                resolve(box);
            },
            // called while loading is progressing
            (xhr) => {
                let contentLength = 0
                if (xhr.lengthComputable) {
                    contentLength = xhr.total;
                } else {
                    contentLength = xhr.target.getResponseHeader('content-length');
                }
                if (contentLength > 0) {
                    store.setState({ modelLoadingProgress: Math.round((xhr.loaded / contentLength) * 100) });
                }
            },
            (error) => {
                reject(error)
            },
        );
    });
}

export default getModel;