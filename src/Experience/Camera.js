import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
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
        // Example: you click a billboard on your right, and the animation turns the camera toward it.
        // The normal controls still aim at where you were looking before. Their update() could turn
        // the camera away from the billboard again, even without you moving the mouse.
        // So billboard viewing sets controls.enabled to false, and this check skips their update().
        // Let the flight and billboard following position the camera until Back returns us home.
        // Works also moves the camera itself, so we skip normal controls while Works is open.
        const canUpdateControls = this.controls.enabled && !this.experience.works?.active
        if (canUpdateControls) this.controls.update()
    }
}