import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

export default function loadModel() {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("brigite")

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    return new Promise((resolve, reject) => {
        loader.load(
            "brigite/scene.gltf",
            gltf => resolve(gltf.scene),
            undefined,
            e => reject(e)
        )
    })
}