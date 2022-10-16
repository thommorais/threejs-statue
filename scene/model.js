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

                const box = gltf.scene;
                box.traverse((child) => {
                    if (child.isMesh) {
                        child.material = boxMaterial
                    }
                });

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

export function resizeModel(modelSize) {
    const proportion = (modelSize.y * 20)

    const y = modelSize.y / proportion
    const x = modelSize.x / proportion
    const z = modelSize.z / proportion

    return { x, y, z }
}


export async function getModelCenterAndSize(model) {

    const { Vector3, Box3 } = await import('three')

    const box = new Box3().setFromObject(model)
    const modelCenter = box.getCenter(new Vector3())
    const modelSize = box.getSize(new Vector3())

    return { center: modelCenter, size: modelSize }

}

