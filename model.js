import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { MeshStandardMaterial } from 'three'

export default function loadModel() {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("/draco/")

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    return new Promise((resolve, reject) => {
        loader.load(
            "angel/scene.gltf",
            gltf => {

                const boxMaterial = new MeshStandardMaterial({
                    roughness: 0.7,
                    metalness: 0.75
                })

                let box = gltf.scene;
                box.traverse((child) => {
                    if (child.isMesh) {
                        console.log(child.material)
                        child.material = boxMaterial
                    }
                });

                resolve(box)

            },
            // called while loading is progressing
            function (xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            e => reject(e)
        )
    })
}