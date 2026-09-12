// Import basic libraries
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import Experience from '../Experience'

// import custom render target
import { Vector3, WebGLRenderTarget } from 'three'

// import shader passes
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js' // points
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js' // glitch
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js' // custom shaders
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js' // aberration
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js' // glow
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js' // pixels

// import custom shaders
import tintVertexShader from '../shaders/tintShader/tintVertexShader.glsl'
import tintFragmentShader from '../shaders/tintShader/tintFragmentShader.glsl'
import dispacementVertexShader from '../shaders/dispacementShader/dispacementVertexShader.glsl'
import dispacementFragmentShader from '../shaders/dispacementShader/dispacementFragmentShader.glsl'
import normalMapVertexShader from '../shaders/normalMapShader/normalMapVertexShader.glsl'
import normalMapFragmentShader from '../shaders/normalMapShader/normalMapFragmentShader.glsl'

// import sRGB fix shader
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js' // points

// import anitalising for crappy browhers like old safari
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js' // atialising

export default class PostProcessing
{
    constructor()
    {        
        // Debug
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.renderer = this.experience.renderer
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.time = this.experience.time
        this.resources = this.experience.resources

        /**
         * Effect composers
         */

        // v1 - standard composer with no antialising method
        // this.effectComposer = new EffectComposer(this.renderer.instance) // Eadd extra step before display
        
        // v2 - with antialising
        // provide to effectComposer a custom render target with antialising metod
        // step 1 - create custom render target with antialising method
        this.renderTarget = new WebGLRenderTarget(800, 600, 
            {
                // step 3 - add antialising samples 2 for shit screens, 0 for retina
                // this part may not work in safari and other shit browthers
                samples: this.renderer.instance.getPixelRatio() === 1 ? 2 : 0
            })
        // step 2 - provide render target to our effect composer
        this.effectComposer = new EffectComposer(this.renderer.instance, this.renderTarget)
        this.effectComposer.setPixelRatio(this.sizes.pixelRatio)
        this.effectComposer.setSize(this.sizes.width, this.sizes.height)
        
        /**
         * enable render passes
         */
        this.renderPass = new RenderPass(this.scene, this.camera.instance) // plane with texture on it
        this.effectComposer.addPass(this.renderPass) // add pass frame to the scene
        this.setPasses() // add shaders
    }

    setPasses()
    {
        /**
         * 1. Standard THREE Passes
         */

        // 1.1 Dot Screen pass
        this.dotScreenPass = new DotScreenPass() // points shader
        this.dotScreenPass.enabled = false
        this.effectComposer.addPass(this.dotScreenPass)

        // 1.2 Glitch pass
        this.glitchPass = new GlitchPass() // glitches
        this.glitchPass.enabled = false
        this.glitchPass.goWild = false
        this.effectComposer.addPass(this.glitchPass)

        // 1.3 Abberation pass
        this.rgbShiftPass = new ShaderPass(RGBShiftShader) // aberration
        this.rgbShiftPass.enabled = false
        this.effectComposer.addPass(this.rgbShiftPass)

        // 1.4 Unreal pass
        this.unrealBloomPass = new UnrealBloomPass() // Blooming
        this.unrealBloomPass.enabled = false
        this.unrealBloomPass.strength = 4
        this.unrealBloomPass.radius = - 0.74
        this.unrealBloomPass.threshold = 0.362
        this.effectComposer.addPass(this.unrealBloomPass)

        // 1.5 Pixelate
        const pixelSize = 6
        this.pixelatePass = new RenderPixelatedPass( pixelSize, this.scene, this.camera.instance ) // pixels
        this.pixelatePass.enabled = false
        this.effectComposer.addPass(this.pixelatePass)

        /**
         * 2 Custom passes
         */

        // 2.1 Tint pass
        this.TintShader = {
            uniforms: 
            {
                tDiffuse: { value : null },
                uTint: { value : null }
            },
            vertexShader: tintVertexShader,
            fragmentShader: tintFragmentShader
        }
        this.tintPass = new ShaderPass(this.TintShader)
        this.tintPass.enabled = false
        this.tintPass.material.uniforms.uTint.value = new THREE.Vector3(0.06, -0.1, 0.06)
        this.effectComposer.addPass(this.tintPass)

        // 2.2 Displacement pass
        this.DispacementShader = {
            uniforms: 
            {
                tDiffuse: { value : null },
                uTime: { value : null }
            },
            vertexShader: dispacementVertexShader,
            fragmentShader: dispacementFragmentShader
        }
        this.dispacementPass = new ShaderPass(this.DispacementShader)
        this.dispacementPass.enabled = true
        this.dispacementPass.material.uniforms.uTime.value = 0
        this.effectComposer.addPass(this.dispacementPass)

        // 2.3 Normal Map Displacement pass
        this.normalMapShader = {
            uniforms: 
            {
                tDiffuse: { value : null },
                uNormalMap: { value : null }
            },
            vertexShader: normalMapVertexShader,
            fragmentShader: normalMapFragmentShader
        }
        this.normalMapPass = new ShaderPass(this.normalMapShader)
        this.normalMapPass.enabled = false
        // Wait for resources
        this.resources.on('ready', () =>
        {
            this.interfaceNormalMap = this.resources.items.interfaceNormalMap
            this.normalMapPass.material.uniforms.uNormalMap.value = this.interfaceNormalMap
        })
        this.effectComposer.addPass(this.normalMapPass)

        /**
         * BugFix passes
         */

        // Correct gamma
        this.gammaCorrectionPass = new ShaderPass(GammaCorrectionShader) // SRGB from LINEAR
        this.gammaCorrectionPass.enabled = false
        this.effectComposer.addPass(this.gammaCorrectionPass)

        // enable antialising for shit browsers
        // SMAA Pass
        // console.log(this.renderer.instance.capabilities)
        if(this.renderer.instance.getPixelRatio() === 1 && !this.renderer.instance.capabilities.isWebGL2)
        {
            this.smaaPass = new SMAAPass()
            this.smaaPass.enabled = true
            this.effectComposer.addPass(this.smaaPass)
        }
        this.setDebug()
    }

    setDebug()
    {
        this.debug = this.experience.debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('post processing')
            this.debugFolder.close()
            
            this.debugFolder.add(this.dotScreenPass, 'enabled').name('dotScreenPass')
            this.debugFolder.add(this.glitchPass, 'enabled').name('glitchPass')
            this.debugFolder.add(this.glitchPass, 'goWild').name('glitchPassWild')
            this.debugFolder.add(this.rgbShiftPass, 'enabled').name('rgbShiftPass')
            this.debugFolder.add(this.unrealBloomPass, 'enabled').name('unrealBloomPass')
            this.debugFolder.add(this.unrealBloomPass, 'strength', 0, 10).name('unrealBloom-S')
            this.debugFolder.add(this.unrealBloomPass, 'radius', -2, 0.5).name('unrealBloom-R')
            this.debugFolder.add(this.unrealBloomPass, 'threshold', 0, 0.5).name('unrealBloom-T')
            this.debugFolder.add(this.tintPass, 'enabled').name('tintPass')
            this.debugFolder.add(this.tintPass.material.uniforms.uTint.value, 'x', -1, 1).name('tintPassR')
            this.debugFolder.add(this.tintPass.material.uniforms.uTint.value, 'y', -1, 1).name('tintPassG')
            this.debugFolder.add(this.tintPass.material.uniforms.uTint.value, 'z', -1, 1).name('tintPassB')
            this.debugFolder.add(this.dispacementPass, 'enabled').name('dispacementPass')
            this.debugFolder.add(this.normalMapPass, 'enabled').name('normalMapPass')
            this.debugFolder.add(this.pixelatePass, 'enabled').name('pixelatePass')
            this.debugFolder.add(this.gammaCorrectionPass, 'enabled').name('sRGB')
            if(this.smaaPass){this.debugFolder.add(this.smaaPass, 'enabled').name('smaaPass')}
            
        }
    }

    resize() // fixes resulution bug after resize
    {
        this.effectComposer.setSize(this.sizes.width, this.sizes.height)
        this.effectComposer.setPixelRatio(this.sizes.pixelRatio)
    }

    render()
    {
        // Implement render logic using EffectComposer
        this.effectComposer.render();
    }

    update()
    {
        this.dispacementPass.material.uniforms.uTime.value = this.time.elapsed
    }
}