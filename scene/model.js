import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { MeshStandardMaterial } from 'three'

export default function loadModel() {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("/draco/")
    dracoLoader.preload()

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    return new Promise((resolve, reject) => {
        loader.load(
            "angel/scene.glb",
            gltf => {

                const boxMaterial = new MeshStandardMaterial({
                    roughness: 0.6,
                    metalness: 0.75
                })

                const box = gltf.scene

                box.traverse((child) => {
                    if (child.isMesh) {
                        child.material = boxMaterial
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })


                resolve(box)

            },
            // called while loading is progressing
            function (xhr) {

                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            e => reject(e)
        )
    })
}

