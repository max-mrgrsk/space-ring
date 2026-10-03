import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
    constructor(experience)
    {
        this.experience = experience
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.debug = this.experience.debug

        this.setInstance()
        this.setControls()
        this.setDebug()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(
            75,
            this.sizes.width / this.sizes.height,
            0.01,
            100)
        this.instance.position.set(7, 0, 0)
        this.scene.add(this.instance)
    }

    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.maxDistance = 50
    }
    setDebug()
    {
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Camera')
            this.debugFolder.close()
            this.debugFolder.add(this.instance.position, 'x', 0, 10, 0.01)
            this.debugFolder.add(this.instance.position, 'y', 0, 10, 0.01)
            this.debugFolder.add(this.instance.position, 'z', 0, 10, 0.01)
        }
    }
    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }
    // Keep the home view responsive to mouse controls, while leaving billboard and Works views undisturbed.
    update()
    {
        // State.js enables these controls only for the settled station view.
        // Updating them while disabled could turn the camera away from an animation or the billboard we are viewing.
        if (this.controls.enabled) this.controls.update()
    }
}
