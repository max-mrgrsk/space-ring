import * as THREE from 'three'

// mesh merger
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'


export default class Player
{
    constructor(experience)
    {
        this.experience = experience
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        this.time  = this.experience.time

        this.stationRadius = this.experience.world.spaceStation.parameters.stationRadius
        this.houseMaxHeight = this.experience.world.spaceStation.parameters.houseMaxHeight
        this.roofTopRadius = this.stationRadius - this.houseMaxHeight
        this.flightHeight = - 0.05
        this.playerHeight = - this.roofTopRadius + this.flightHeight

        this.setParameters()
        this.setGeometry()
        this.setMaterial()
        this.setMesh()
        this.setDebug()
    }
    setParameters()
    {
        this.parameters = {}
        this.parameters.flightHeight = - 0.009
        this.parameters.rotationSpeed = 0.001
        this.parameters.playerScale = 0.0012

        this.parameters.wingWidth = 2.5
        this.parameters.wingHeight = 0.57
        this.parameters.wingShift = 0.46
        this.parameters.turbineHeight = 0.89
        this.parameters.turbineExit = 1.87
        this.parameters.turbineCapOffset = - 1.41

        this.mergedGeometry = null
        this.material = null
        this.mesh = null
    }
    updatePlayer()
    {
        this.disposePlayer()
        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }
    disposePlayer()
    {
        this.scene.remove(this.mesh)

        this.mesh.geometry.dispose()
        this.mesh.material.dispose()
        this.mesh = null

        this.material.dispose()
        this.material = null

        this.mergedGeometry.dispose()
        this.mergedGeometry = null
    }
    setGeometry()
    {
        this.geometry = []

        /**
         * 1. Box
         */
        const box = new THREE.BoxGeometry(
            1, // width
            2, // height
            4  // length
        )
        /**
         * 2. Wing
         */
        const wing = new THREE.BoxGeometry(
            this.parameters.wingWidth * 2, // width
            0.3, // height
            2  // length
        )
        wing.translate(
            0.0, // shift right
            this.parameters.wingHeight, // height
            this.parameters.wingShift // shift back
        )
        /**
         * 3. Turbine
         */
        const cylinder1 = new THREE.CylinderGeometry(
            0.6, // width
            0.6, // height
            3,  // length
            6
        )
        cylinder1.rotateX(Math.PI/2)
        cylinder1.translate(
            this.parameters.wingWidth, // shift right
            this.parameters.turbineHeight, // height
            this.parameters.wingShift // shift back
        )
        const cylinder2 = new THREE.CylinderGeometry(
            0.6, // width
            0.6, // height
            3,  // length
            6
        )
        cylinder2.rotateX(Math.PI/2)
        cylinder2.translate(
            -this.parameters.wingWidth, // shift right
            this.parameters.turbineHeight, // height
            this.parameters.wingShift // shift back
        )
        /**
         * 3. Turbine fire
         */
        const turbineFire1 = new THREE.CylinderGeometry(
            0.35, // width
            0.35, // height
            1,  // length
            6
        )
        turbineFire1.rotateX(Math.PI/2)
        turbineFire1.translate(
            this.parameters.wingWidth, // shift right
            this.parameters.turbineHeight, // height
            this.parameters.turbineExit // shift back
        )
        const turbineFire2 = new THREE.CylinderGeometry(
            0.35, // width
            0.35, // height
            1,  // length
            6
        )
        turbineFire2.rotateX(Math.PI/2)
        turbineFire2.translate(
            -this.parameters.wingWidth, // shift right
            this.parameters.turbineHeight, // height
            this.parameters.turbineExit // shift back
        )
        /**
         * 3. Turbine cap
         */
        const turbineCap1 = new THREE.ConeGeometry(
            0.5, // width
            0.5, // height
            6, // length
            1
        )
        turbineCap1.rotateX(-Math.PI/2)
        turbineCap1.translate(
            this.parameters.wingWidth, // shift right
            this.parameters.turbineHeight, // height
            this.parameters.turbineCapOffset // shift back
        )
        const turbineCap2 = new THREE.ConeGeometry(
            0.5, // width
            0.5, // height
            6, // length
            1
        )
        turbineCap2.rotateX(-Math.PI/2)
        turbineCap2.translate(
            -this.parameters.wingWidth, // shift right
            this.parameters.turbineHeight, // height
            this.parameters.turbineCapOffset // shift back
        )
        /**
         * 3. cockpit
         */
        const cockpit = new THREE.CylinderGeometry(
            0.4, // width
            0.4, // height
            1.55,  // length
            6
        )
        cockpit.translate(
            0.0, // shift right
            0.0, // height
            - 0.0035 // shift back
        )
        /**
         * 4. Push
         */
        this.geometry.push(
            box,
            wing,
            cylinder1,
            cylinder2,
            turbineFire1,
            turbineFire2,
            turbineCap1,
            turbineCap2,
            cockpit)

        this.mergedGeometry = BufferGeometryUtils.mergeGeometries(this.geometry)
    }
    setMaterial()
    {
        this.material = new THREE.MeshNormalMaterial()
    }
    setMesh()
    {
        this.mesh = new THREE.Mesh(this.mergedGeometry, this.material)
        this.mesh.position.y = this.playerHeight + this.parameters.flightHeight
        this.mesh.scale.set(
            this.parameters.playerScale,
            this.parameters.playerScale,
            this.parameters.playerScale)
        this.scene.add(this.mesh)
    }
    setDebug()
    {
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Player')
            this.debugFolder.close()
            this.debugFolder.add(this.parameters, 'flightHeight', -0.03, 0.03, 0.001)
                .onChange( () => {this.updatePlayer()} )
            this.debugFolder.add(this.parameters, 'playerScale', 0.0001, 0.003, 0.0001)
                .onChange( () => {this.updatePlayer()} )
            this.debugFolder.add(this.parameters, 'wingHeight', -1, 1, 0.01)
                .onChange( () => {this.updatePlayer()} )
            this.debugFolder.add(this.parameters, 'wingShift', -1, 1, 0.01)
                .onChange( () => {this.updatePlayer()} )
            this.debugFolder.add(this.parameters, 'turbineHeight', -1, 1, 0.01)
                .onChange( () => {this.updatePlayer()} )
            this.debugFolder.add(this.parameters, 'turbineExit', -3, 3, 0.01)
                .onChange( () => {this.updatePlayer()} )
            this.debugFolder.add(this.parameters, 'turbineCapOffset', -3, 3, 0.01)
                .onChange( () => {this.updatePlayer()} )
        }
    }
    update()
    {

        this.mesh.position.x = Math.sin( this.time.elapsed * this.parameters.rotationSpeed * 1.2 ) * 0.002
        this.mesh.rotation.z = Math.sin(this.time.elapsed * this.parameters.rotationSpeed * 1.2 ) * 0.2

        this.mesh.position.y =
            this.playerHeight
            + this.parameters.flightHeight
            + Math.sin( this.time.elapsed * this.parameters.rotationSpeed ) * 0.002
        this.mesh.rotation.x = Math.sin(this.time.elapsed * this.parameters.rotationSpeed) * 0.2

        this.mesh.position.z = Math.sin( this.time.elapsed * this.parameters.rotationSpeed * 0.7 ) * 0.002


    }
}
