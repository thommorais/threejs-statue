import { MeshStandardMaterial } from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


function getModel(modelPath, store) {

    const { isMobile } = store.getState().gpuData
    console.log(store.getState().gpuData)

    return new Promise((resolve, reject) => {
        try {

            const loader = new GLTFLoader();
            const dracoLoader = new DRACOLoader();

            dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
            dracoLoader.setWorkerLimit(5)

            // if (isMobile) {
            //     dracoLoader.setDecoderConfig({ type: 'js' });
            // }

            dracoLoader.preload();
            dracoLoader.setDr

            loader.setDRACOLoader(dracoLoader);

            if (!modelPath) {
                reject(new Error('modelPath is required'));
            }

            const onProgress = (xhr) => {
                if (xhr.lengthComputable) {
                    const percentComplete = xhr.loaded / xhr.total * 100;
                    const roundedPercent = Math.round(percentComplete);
                    if (roundedPercent % 10 === 0) {
                        const modelLoadingProgress = Number((roundedPercent).toFixed(2))
                        store.setState({ modelLoadingProgress });
                    }
                }

                if (xhr.loaded === xhr.total) {
                    return true
                }

            }

            loader.loadAsync(modelPath, onProgress).then(({ scene, }) => {

                try {

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

                    box.matrixAutoUpdate = false
                    box.name = 'character'

                    dracoLoader.dispose()
                    loader.setDRACOLoader(null)
                    resolve(box);

                } catch (error) {
                    console.log(error)

                }
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
