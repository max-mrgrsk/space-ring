import * as THREE from 'three'

// mesh merger
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// houses
import BoxHouses from './SpaceStationParts/Houses/BoxHouses'
import SlabHouses from './SpaceStationParts/Houses/SlabHouses'
import Floors from './SpaceStationParts/Floors'
import StackedHouses from './SpaceStationParts/Houses/StackedHouses'
import FacadeHouses from './SpaceStationParts/Houses/FacadeHouses'

export default class SpaceStation
{
    constructor(experience)
    {
        

        this.experience = experience
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
        
        this.parameters.stationRadius = 3
        this.parameters.stationWidth = 1
        this.parameters.rotationSpeed = 0.0001

        this.parameters.amountOfHouses = 2000
        this.parameters.valleyWidth = 0.12
        this.parameters.houseMaxHeight = 0.5
        this.parameters.houseWidth = 0.09

        this.parameters.amountOfFloors = 25
        this.parameters.floorHeight = 0.05

        this.housesMergedGeometry = null
        this.material = null
        this.houseMesh = null
    }
    updateSpaceStation()
    {
        this.disposeSpaceStation()
        this.setGeometry()
        this.setMesh()
    }
    disposeSpaceStation()
    {
        this.scene.remove(this.group)
        this.group.remove(this.SpaseStationMesh)

        this.SpaseStationMesh.geometry.dispose()
        this.SpaseStationMesh.material.dispose()
        this.SpaseStationMesh = null
        
        this.mergedGeometry.dispose()
        this.mergedGeometry = null
    }
    setGeometry()
    {
        /**
         * Set geometries
         */
        this.geometryArray = []
        this.meshGeometryArray = []

        this.boxHouses = new BoxHouses(
            this.parameters.amountOfHouses,
            this.parameters.stationRadius,
            this.parameters.stationWidth,
            this.parameters.valleyWidth,
            this.parameters.houseWidth,
            this.parameters.houseMaxHeight,
            this.geometryArray)

        this.slabHouses = new SlabHouses(
            this.parameters.amountOfHouses,
            this.parameters.stationRadius,
            this.parameters.valleyWidth,
            this.parameters.houseWidth,
            this.parameters.houseMaxHeight,
            this.geometryArray,
            this.meshGeometryArray)

        this.facadeHouses = new FacadeHouses(
            this.parameters.amountOfHouses,
            this.parameters.stationRadius,
            this.parameters.valleyWidth,
            this.parameters.houseWidth,
            this.parameters.houseMaxHeight,
            this.geometryArray,
            this.meshGeometryArray)

        this.stackedHouses = new StackedHouses(
            this.parameters.amountOfHouses,
            this.parameters.stationRadius,
            this.parameters.valleyWidth,
            this.parameters.houseWidth,
            this.parameters.houseMaxHeight,
            this.geometryArray,
            this.meshGeometryArray)

        this.floors = new Floors(
            this.parameters.amountOfFloors,
            this.parameters.stationRadius,
            this.parameters.stationWidth,
            this.parameters.floorHeight,
            this.geometryArray)

        /**
         * Merge
         */
        this.mergedGeometry = BufferGeometryUtils.mergeGeometries(this.geometryArray)
        this.mergedWireframeGeometry = BufferGeometryUtils.mergeGeometries(this.meshGeometryArray)
    }
    setMaterial()
    {
        this.material = new THREE.MeshNormalMaterial()
        this.wireframeMaterial = new THREE.MeshNormalMaterial({wireframe:true})
    }
    setMesh()
    {
        /**
         * Space Staion
         */
        this.group = new THREE.Group()
        this.group.name = ('SpaceStation')
        this.scene.add(this.group)

        this.SpaceStationMesh = new THREE.Mesh(this.mergedGeometry, this.material)
        this.SpaceStationWireframeMesh = new THREE.Mesh(this.mergedWireframeGeometry, this.wireframeMaterial)
        this.group.add(this.SpaceStationMesh,this.SpaceStationWireframeMesh)
    }
    setDebug()
    {
        if(this.debug.active)
        {
            this.debugFoloder = this.debug.ui.addFolder('SpaceStation')
            this.debugFoloder.close()
            
            this.debugFoloder.add(this.parameters, 'stationRadius', 0.1, 10, 0.1)
                .onChange( () => {this.updateSpaceStation()} )
            this.debugFoloder.add(this.parameters, 'stationWidth', 0.1, 10, 0.1)
                .onChange( () => {this.updateSpaceStation()} )
            this.debugFoloder.add(this.parameters, 'rotationSpeed', 0.00001, 0.0004, 0.000001)

            this.debugFoloder.add(this.parameters, 'amountOfHouses', 1, 10000, 1)
                .onChange( () => {this.updateSpaceStation()} )
            this.debugFoloder.add(this.parameters, 'valleyWidth', 0, 0.4, 0.01)
                .onChange( () => {this.updateSpaceStation()} )
            this.debugFoloder.add(this.parameters, 'houseMaxHeight', 0.1, 2, 0.01)
                .onChange( () => {this.updateSpaceStation()} )
            this.debugFoloder.add(this.parameters, 'houseWidth', 0.01, 0.5, 0.01)
                .onChange( () => {this.updateSpaceStation()} )

            this.debugFoloder.add(this.parameters, 'amountOfFloors', 1, 100, 1)
                .onChange( () => {this.updateSpaceStation()} )
            this.debugFoloder.add(this.parameters, 'floorHeight', 0.01, 0.5, 0.01)
                .onChange( () => {this.updateSpaceStation()} )
        }
    }
    update()
    {
        this.group.rotation.x = - this.time.elapsed * this.parameters.rotationSpeed
    }
}