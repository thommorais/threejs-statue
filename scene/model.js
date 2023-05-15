import { MeshStandardMaterial } from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


function printDataOnHTML(data) {
    const dataContainer = document.getElementById('dataContainer');
    dataContainer.innerHTML = data;
}

function getModel(modelPath, store) {

    const { isMobile } = store.getState().gpuData

    return new Promise((resolve, reject) => {
        try {

            const loader = new GLTFLoader();
            const dracoLoader = new DRACOLoader();

            dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
            dracoLoader.setWorkerLimit(5)
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
                        const modelLoadingProgress = Number((roundedPercent).toFixed(2))
                        printDataOnHTML(`model loading: ${modelLoadingProgress}`)
                        store.setState({ modelLoadingProgress });
                    }
                }

                if (xhr.loaded === xhr.total) {
                    return true
                }

            }

            const actualModelPath = isMobile ? `${modelPath.replace('.glb', '.opt.glb')}` : `${modelPath}`
            loader.loadAsync(actualModelPath, onProgress).then(({ scene, }) => {
                printDataOnHTML(`model loaded`)

                try {

                    printDataOnHTML('loaded')

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
                    printDataOnHTML(error)

                }
            }).catch((error) => {
                printDataOnHTML('error 1')
                store.setState({ modelLoadingProgress: 0, modelError: error });
                reject(error);
            })

        } catch (error) {
            printDataOnHTML('error 2')
            reject(error);
        }

    });
}

export default getModel;
