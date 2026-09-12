import * as THREE from 'three'
import Experience from './Experience.js'

export default class Renderer
{
    constructor()
    {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.time = this.experience.time
        this.debug = this.experience.debug

        // this.postProcessing = this.experience.postProcessing
        // as the PostProcessing is initiated after the Renderer - 
        // you can not fetch it here, but you can receive all you need in
        // the update section passing it directly from expericne update function

        this.setInstance() // set renderer
    }

    setInstance()
    {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1.5
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFShadowMap
        this.instance.outputColorSpace = THREE.SRGBColorSpace
        this.instance.setClearColor('#211d20')
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    update(postProcessing)
    {
        // 1. Render with normal renderer
        // this.instance.render(this.scene, this.camera.instance)

        // 2. Render with EffectComposer, render passes add Post processing        
        // passed directly from the einvironment
        // postProcessing.render()

        // 3. turn postprocessing on and off again
        // console.log(this.time.elapsed)
        // if(this.time.elapsed<2000){postProcessing.render()}else{this.instance.render(this.scene, this.camera.instance)}

        // 4. combination of 1 and 3
        if(this.debug.active)
        {
            this.instance.render(this.scene, this.camera.instance)
        } else
        {
            if(this.time.elapsed<2000){postProcessing.render()}else{this.instance.render(this.scene, this.camera.instance)}
        }
    }
}