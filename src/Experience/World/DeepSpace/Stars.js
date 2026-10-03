import * as THREE from 'three'

// Shaders
import starVertexShader from '../../shaders/starShader/starVertexShader.glsl'
import starFragmentShader from '../../shaders/starShader/starFragmentShader.glsl'

export default class Stars
{
    constructor(experience)
    {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time

        this.setParameters()
        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setPoints()
        this.setDebug()
    }
    setParameters()
    {
        this.parameters = {}
        this.parameters.starCount = 10000
        this.parameters.spaceMinRadius = 25
        this.parameters.spaceMaxRadius = 50
        this.parameters.spaceRotationSpeed = 0.0001

        this.parameters.starMinSize = 1
        this.parameters.starMaxSize = 3

        this.parameters.insideColor = '#ff0040'
        this.parameters.outsideColor = '#00e1ff'

        this.geometry = null
        this.material = null
        this.points = null
    }
    updateStars()
    {
        this.disposePoints()
        this.setGeometry()
        this.setMaterial()
        this.setPoints()
    }
    disposePoints()
    {
        this.scene.remove(this.points)
        this.points.geometry.dispose()
        this.points.material.dispose()
        this.points = null

        this.material.dispose()
        this.material = null

        this.geometry.dispose()
        this.geometry = null
    }
    setGeometry()
    {
        this.positions = new Float32Array(this.parameters.starCount * 3)
        this.colors = new Float32Array(this.parameters.starCount * 3)
        this.sizes = new Float32Array(this.parameters.starCount * 1)
        this.scales = new Float32Array(this.parameters.starCount * 1) // add randomness

        this.insideColor = new THREE.Color(this.parameters.insideColor)
        this.outsideColor = new THREE.Color(this.parameters.outsideColor)

        for(let i=0; i<this.parameters.starCount; i++)
        {
            // position
            const normalizedRadius = Math.random()
            const radius = normalizedRadius * (this.parameters.spaceMaxRadius - this.parameters.spaceMinRadius) + this.parameters.spaceMinRadius
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            this.positions[i * 3 + 0] = x;
            this.positions[i * 3 + 1] = y;
            this.positions[i * 3 + 2] = z;

            // color
            this.mixedColor = this.insideColor.clone()
            this.mixedColor.lerp(this.outsideColor, normalizedRadius)

            this.colors[i * 3 + 0] = this.mixedColor.r;
            this.colors[i * 3 + 1] = this.mixedColor.g;
            this.colors[i * 3 + 2] = this.mixedColor.b;

            // scale
            this.sizes[i] = normalizedRadius;
            this.scales[i] = Math.random();
        }
        
        // create buffergeometry and add this numbers as locations
        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions,3))
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors,3))
        this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes,1))
        this.geometry.setAttribute('aScale', new THREE.BufferAttribute(this.scales,1))
    }
    setTextures()
    {
        this.starTexture = this.resources.items.star
    }
    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            uniforms: {
                uTime: { value : 0 },
                uRotationSpeed: { value : this.parameters.spaceRotationSpeed },
                uMinSize: { value: this.parameters.starMinSize * this.experience.sizes.pixelRatio},
                uMaxSize: { value: this.parameters.starMaxSize * this.experience.sizes.pixelRatio}
            },
            vertexShader: starVertexShader,
            fragmentShader: starFragmentShader
        })
    }
    setPoints()
    {
        this.points = new THREE.Points(
            this.geometry,
            this.material
        )

        this.scene.add(this.points)
    }
    setDebug()
    {
        this.debug = this.experience.debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Stars')
            this.debugFolder.close()

            // space
            this.debugFolder
                .add(this.parameters, 'starCount', 1,100000,1)
                .onChange(() => {this.updateStars()})
            this.debugFolder
                .add(this.parameters, 'spaceMinRadius', 1,20,1)
                .onChange(() => {this.updateStars()})
            this.debugFolder
                .add(this.parameters, 'spaceMaxRadius', 1,100,1)
                .onChange(() => {this.updateStars()})
            this.debugFolder
                .add(this.parameters, 'spaceRotationSpeed', 0.00001,0.0002,0.000001)
                .onChange(() => {this.material.uniforms.uRotationSpeed.value = this.parameters.spaceRotationSpeed})

            // stars
            this.debugFolder
                .add(this.parameters, 'starMinSize', 0.1, 10, 0.1)
                .onChange(() => {this.material.uniforms.uMinSize.value = this.parameters.starMinSize * this.experience.sizes.pixelRatio})
            this.debugFolder
                .add(this.parameters, 'starMaxSize', 0.1, 10, 0.1)
                .onChange(() => {this.material.uniforms.uMaxSize.value = this.parameters.starMaxSize * this.experience.sizes.pixelRatio})

            // colors
            this.debugFolder
                .addColor(this.parameters, 'insideColor')
                .onChange(() => {this.updateStars()})
            this.debugFolder
                .addColor(this.parameters, 'outsideColor')
                .onChange(() => {this.updateStars()})
        }
    }
    update()
    {
        this.material.uniforms.uTime.value = this.time.elapsed
    }
}