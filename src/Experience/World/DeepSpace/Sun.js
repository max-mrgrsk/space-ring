import * as THREE from 'three'
import Experience from '../../Experience'

// import shaders
import sunVertexShader from '../../shaders/sunShader/sunVertexShader.glsl'
import sunFragmentShader from '../../shaders/sunShader/sunFragmentShader.glsl'

export default class Sun
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        this.camera = this.experience.camera.instance
        this.time = this.experience.time

        this.setParameters()
        this.setGeometry()
        this.setMaterial()
        this.setMesh()
        this.setDebug()
    }
    setParameters()
    {
        this.parameters = {}
        this.parameters.sunScale = 5
    }
    setGeometry()
    {
        this.geometry = new THREE.PlaneGeometry()
        this.geometry.scale.z = 5
    }
    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            uniforms: {
                uTime: {value : 0}
            },
            vertexShader: sunVertexShader,
            fragmentShader: sunFragmentShader
        })
    }
    setMesh()
    {
        this.mesh = new THREE.Mesh(
            this.geometry,
            this.material
        )
        this.mesh.scale.x = this.parameters.sunScale
        this.mesh.scale.y = this.parameters.sunScale
        this.mesh.position.x = -20
        this.scene.add(this.mesh)
    }
    setDebug()
    {
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Sun')
            this.debugFolder.close()

            this.debugFolder.add(this.mesh.position, 'x', -20, 0, 0.1)
                .name('distance')
            this.debugFolder.add(this.parameters, 'sunScale', 0, 10, 0.01)
                .onChange( () => {
                    this.mesh.scale.x = this.parameters.sunScale,
                    this.mesh.scale.y = this.parameters.sunScale})
            this.debugFolder.add(this.material, 'wireframe')
            this.debugFolder.add(this.mesh, 'visible')
        }
    }
    update()
    {
        this.mesh.lookAt(this.camera.position)
        this.material.uniforms.uTime.value = this.time.elapsed
        
    }
}