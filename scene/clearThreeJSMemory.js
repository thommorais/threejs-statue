function removeChildren(object) {
    while (object.children.length > 0) {
        removeChildren(object.children[0]);
        object.remove(object.children[0]);
    }
}


function disposeMaterial(material) {
    for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && typeof value === 'object' && 'minFilter' in value) {
            value.dispose();
        }
    }
    material.dispose();
}


function disposeResources(object) {
    if (object.geometry) {
        object.geometry.dispose();
    }

    if (object.dispose) {
        object.dispose()
    }

    if (object.children) {
        object.children.forEach(disposeResources)
    }

    if (object.material) {
        if (Array.isArray(object.material)) {
            object.material.forEach(material => disposeMaterial(material));
        } else {
            disposeMaterial(object.material);
        }
    }
}



function clearThreeJSMemoryFronScene(scene) {
    scene.traverse(disposeResources);
    removeChildren(scene);
}


export default clearThreeJSMemoryFronScene;