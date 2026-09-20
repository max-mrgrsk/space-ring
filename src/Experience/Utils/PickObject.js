import * as THREE from 'three'

// Reuse these tools for each check, including hover checks that run every frame.
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

// Find the closest 3D object under a screen position, for clicks, taps, or hover.
// Return the hit (with the object in hit.object), or null when nothing was hit.
// root is the container group holding these objects, including any groups nested inside it.
// Billboards passes its billboard group; Works passes its group of models and labels.
// objects lists what we allow the pointer to pick: billboard images or Works labels.
export default function pickObject({ x, y, canvas, camera, root, objects, recursive = true })
{
    // Convert the screen position to the coordinates Three.js uses inside the canvas.
    // Using the canvas bounds also works when the canvas does not fill the whole page.
    const rect = canvas.getBoundingClientRect()
    pointer.set((x - rect.left) / rect.width * 2 - 1, -(y - rect.top) / rect.height * 2 + 1)

    // Moving or rotating a group changes where everything inside it is in the scene.
    // Refresh root and its contents so we check their current positions, not their old ones.
    // For example, a Works label moves when its containing group scrolls.
    root.updateMatrixWorld(true)
    // The camera may also have moved since the last rendered frame.
    camera.updateMatrixWorld()

    // Cast an invisible line from the camera through this point and take the nearest hit.
    // recursive controls whether children of the listed objects can also be picked.
    raycaster.setFromCamera(pointer, camera)
    return raycaster.intersectObjects(objects, recursive)[0] || null
}
