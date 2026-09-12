import * as THREE from 'three'
import Experience from '../../Experience'

// mesh merger
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'


export default class SpaceCars
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        this.time  = this.experience.time

        this.stationRadius = this.experience.world.spaceStation.parameters.stationRadius
        this.houseMaxHeight = this.experience.world.spaceStation.parameters.houseMaxHeight

        this.setParameters()
        this.setGeometry()
        this.setMaterial()
        this.setMesh()
        this.setDebug()
    }
    setParameters()
    {
        // this.parameters = this.experience.world.stationParameters.parameters

        this.parameters = {}
        this.parameters.amountOfCars = 1000
        this.parameters.flightHeight = 0.3
        this.parameters.rotationSpeed = 0.0003

        this.parameters.carScale = 0.002

        this.mergedGeometry = null
        this.material = null
        this.mesh = null
    }
    updateCars()
    {
        this.disposeCars()
        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }
    disposeCars()
    {
        this.scene.remove(this.mesh)
        this.scene.remove(this.meshClone)

        this.mesh.geometry.dispose()
        this.mesh.material.dispose()
        this.mesh = null

        this.meshClone.geometry.dispose()
        this.meshClone.material.dispose()
        this.meshClone = null

        this.material.dispose()
        this.material = null

        this.mergedGeometry.dispose()
        this.mergedGeometry = null
    }
    setGeometry()
    {
        this.geometry = []
        for(let i=0; i<this.parameters.amountOfCars; i++)
        {
            // 1. Parameters
            const radius = this.stationRadius - this.houseMaxHeight - this.parameters.flightHeight
            const angle = Math.random() * Math.PI * 2
            
            // 2. Geometries
            const box = new THREE.BoxGeometry(
                2 * this.parameters.carScale, // width
                5 * this.parameters.carScale, // length
                2 * this.parameters.carScale  // height
            ) 

            // 3. Rotations
            box.rotateX(-angle)

            // 4. Positions
            const x = (Math.random() - 0.5) * 0.2 + 0.2
            const y = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius
            box.translate(x,y,z)

            // 5. Push
            this.geometry.push(box)
        }
        this.mergedGeometry = BufferGeometryUtils.mergeGeometries(this.geometry)
    }
    setMaterial()
    {
        this.material = new THREE.MeshNormalMaterial()
    }
    setMesh()
    {
        this.mesh = new THREE.Mesh(this.mergedGeometry, this.material)
        this.meshClone = this.mesh.clone()
        this.meshClone.rotation.y = Math.PI 
        this.scene.add(this.mesh, this.meshClone)
    }
    setDebug()
    {
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Cars')
            this.debugFolder.close()
            this.debugFolder.add(this.parameters, 'flightHeight', 0, 1, 0.01)
                .onChange( () => {this.updateCars()} )
            this.debugFolder.add(this.parameters, 'carScale', 0.001, 0.02, 0.001)
                .onChange( () => {this.updateCars()} )
        }   
    }
    update()
    {
        this.mesh.rotation.x = this.time.elapsed * this.parameters.rotationSpeed
        this.meshClone.rotation.x = - this.time.elapsed * this.parameters.rotationSpeed
    }
}