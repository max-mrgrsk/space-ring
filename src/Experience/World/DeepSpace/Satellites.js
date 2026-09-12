import * as THREE from 'three'
import Experience from '../../Experience'

// mesh merger
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default class Satellites
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug
        
        this.setParameters()
        this.setGeometry()
        this.setMaterial()
        this.setMesh()
        this.setDebug()
    }
    setParameters()
    {
        this.parameters = {}
        this.parameters.satellitesCount = 20
        this.parameters.satellitesMinRadius = 5
        this.parameters.satellitesMaxRadius = 8
        this.parameters.satellitesRotationSpeed = 0.0001
        this.parameters.satellitesSize = 2

        this.bodyGeometry = null
        this.wingGeometry = null
        this.bodyMaterial = null
        this.wingMaterial = null
        this.bodyMesh = null
        this.wingMesh = null
    }
    updateSatellites()
    {
        this.disposeSatellites()
        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }
    disposeSatellites()
    {
        this.scene.remove(this.group)

        // bodies
        this.bodyMesh.geometry.dispose()
        this.bodyMesh.material.dispose()
        this.bodyMesh = null

        this.mergedBodyGeometry.dispose()

        this.bodyMaterial.dispose()
        this.bodyMaterial = null

        

        // wings
        this.wingMesh.geometry.dispose()
        this.wingMesh.material.dispose()
        this.wingMesh = null

        this.mergedWingGeometry.dispose()

        this.wingMaterial.dispose()
        this.wingMaterial = null
    }
    setGeometry()
    {
        this.bodyGeometries = []
        this.wingGeometries = []

        for(let i = 0; i < this.parameters.satellitesCount; i++)
        {
            // 1. Geometries
            const size = this.parameters.satellitesSize
            const cylinderRadius = size * 0.01
            const cylinderLength = size * 0.05
            const wingLength = size * 0.25
            const wingWidth = size * 0.05
            const bodyGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderLength, 6, 1)
            const wingGeometry = new THREE.PlaneGeometry(wingLength, wingWidth, 10, 2)

            // 2. Positions
            const normalizedRadius = Math.random()
            const radius = normalizedRadius * (this.parameters.satellitesMaxRadius - this.parameters.satellitesMinRadius) + this.parameters.satellitesMinRadius
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            bodyGeometry.translate(x,y,z)
            wingGeometry.translate(x,y,z)

            // 3. Rotations
            const rotationX = Math.random() * Math.PI
            const rotationY = Math.random() * Math.PI
            const rotationZ = Math.random() * Math.PI
            bodyGeometry.rotateX(rotationX)
            bodyGeometry.rotateY(rotationY)
            bodyGeometry.rotateZ(rotationZ)
            wingGeometry.rotateX(rotationX)
            wingGeometry.rotateY(rotationY)
            wingGeometry.rotateZ(rotationZ)

            // 4. Push
            this.bodyGeometries.push(bodyGeometry)
            this.wingGeometries.push(wingGeometry)
        }

        // merge
        this.mergedBodyGeometry = BufferGeometryUtils.mergeGeometries(this.bodyGeometries)
        this.mergedWingGeometry = BufferGeometryUtils.mergeGeometries(this.wingGeometries)
    }
    setMaterial()
    {
        this.bodyMaterial = new THREE.MeshNormalMaterial()
        this.wingMaterial = new THREE.MeshNormalMaterial({wireframe:true})
    }
    setMesh()
    {
        this.group = new THREE.Group()
        this.group.name = "Satellites"
        this.scene.add(this.group)

        this.bodyMesh = new THREE.Mesh( this.mergedBodyGeometry, this.bodyMaterial )
        this.wingMesh = new THREE.Mesh( this.mergedWingGeometry, this.wingMaterial )
        
        this.group.add(this.bodyMesh)
        this.group.add(this.wingMesh)
    }
    setDebug()
    {
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Satellites')
            this.debugFolder.close()
            this.debugFolder.add(this.parameters, 'satellitesCount', 1, 1000, 1)
                .onChange( () => {this.updateSatellites()} )
            this.debugFolder.add(this.parameters, 'satellitesMinRadius', 1, 50, 0.1)
                .onChange( () => {this.updateSatellites()} )
            this.debugFolder.add(this.parameters, 'satellitesMaxRadius', 1, 50, 0.1)
                .onChange( () => {this.updateSatellites()} )
            this.debugFolder.add(this.parameters, 'satellitesRotationSpeed', 0, 0.0003, 0.000001)
                .onChange( () => {this.updateSatellites()} )
            this.debugFolder.add(this.parameters, 'satellitesSize', 0, 10, 0.01)
                .onChange( () => {this.updateSatellites()} )
        }
    }
    update()
    {
        this.group.rotation.y = this.time.elapsed * this.parameters.satellitesRotationSpeed
    }
}