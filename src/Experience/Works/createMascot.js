import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Keep the imported geometry and use the exact shared Works normal material.
export default function createMascot(normalMaterial)
{
    // Setup
    const group = new THREE.Group()

    // Loading and parsing
    async function load()
    {
        try
        {
            // Load and read the kitty model
            const response = await fetch('/models/kitty-cad-mascot.glb')

            if(!response.ok)
            {
                throw new Error(`Mascot request failed (${response.status})`)
            }

            const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '/models/')

            // Centering and sizing
            const model = gltf.scene
            const bounds = new THREE.Box3().setFromObject(model)
            const size = bounds.getSize(new THREE.Vector3())
            const extent = Math.max(size.x, size.y, size.z)

            if(!Number.isFinite(extent) || extent <= 0)
            {
                throw new Error('Mascot has no usable geometry')
            }

            const normalized = new THREE.Group()
            model.position.sub(bounds.getCenter(new THREE.Vector3()))
            normalized.scale.setScalar(2.3 / extent)
            normalized.add(model)
            group.add(normalized)

            // Material replacement
            // The supplied kitty has one untextured material per mesh primitive.
            const importedMaterials = new Set()

            model.traverse(part =>
            {
                if(!part.isMesh)
                {
                    return
                }

                importedMaterials.add(part.material)
                part.material = normalMaterial
            })

            importedMaterials.forEach(material => material.dispose())
        }
        catch(error)
        {
            console.error('Unable to load Works engineering mascot:', error)
        }
    }

    load()
    return group
}
