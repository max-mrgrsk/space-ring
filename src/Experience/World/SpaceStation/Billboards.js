import * as THREE from 'three'
import Experience from '../../Experience'

// mesh merger
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default class Billboards
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.rotationSpeed = this.experience.world.spaceStation.parameters.rotationSpeed
        this.camera = this.experience.camera.instance
        this.mouse = this.experience.mouse.instance

        this.setTextures()
        this.setParameters()
        this.setGroup()
        this.setImages()
        this.setRaycaster()
        this.setBoxes()
        this.setDebug()
    }
    setTextures()
    {
        this.resources = this.experience.resources
        this.textures = [
            this.resources.items.astanaexpo,        //0
            this.resources.items.etb,               //1
            this.resources.items.freiburg,          //2
            this.resources.items.kehl,
            this.resources.items.moscase1,
            this.resources.items.moscase2,
            this.resources.items.nn,
            this.resources.items.pavilionkarsruhe,
            this.resources.items.petriplatz,
            this.resources.items.photography,
            this.resources.items.raw,
            this.resources.items.rkm,
            this.resources.items.tischtennis,
            this.resources.items.waldsee,
            this.resources.items.warhammer,
            this.resources.items.woodworking
        ]

        // Set sRGB encoding for each texture
        this.textures.forEach(texture => {
            texture.colorSpace = THREE.SRGBColorSpace;
            })

        console.log('amount of works:', this.textures.length)
    }
    setParameters()
    {
        this.parameters = {}
        this.parameters.worksSize = 0.25
        this.parameters.worksCellSize = 0.03

        // Imported 
        this.world = this.experience.world
        this.parameters.stationRadius = this.world.spaceStation.parameters.stationRadius
        this.parameters.houseMaxHeight = this.world.spaceStation.parameters.houseMaxHeight
        this.parameters.stationWidth = this.world.spaceStation.parameters.stationWidth
        this.parameters.flightHeight = this.world.spaceCars.parameters.flightHeight

        // Calculated
        this.parameters.roofTopRadius = this.parameters.stationRadius - this.parameters.houseMaxHeight
        this.parameters.billBoardRadius = this.parameters.roofTopRadius - this.parameters.flightHeight / 2
        this.parameters.billBoardTopEdgeRadius = this.parameters.billBoardRadius - this.parameters.worksSize / 2
        this.parameters.boxRadius = (this.parameters.stationRadius + this.parameters.billBoardTopEdgeRadius) / 2
        this.parameters.boxHeight = this.parameters.stationRadius - this.parameters.billBoardTopEdgeRadius

        this.parameters.angle = Math.PI * 2 / this.textures.length
        this.parameters.angles = []

        this.parameters.positionX = []
        this.parameters.positionY = []
        this.parameters.positionZ = []
        this.parameters.boxY = []
        this.parameters.boxZ = []

        this.parameters.rotationX = []
        this.parameters.rotationY = []
        this.parameters.rotationZ = []
        
        for(let i=0; i < this.textures.length; i++)
        {
            // Angles
            var angles = i * this.parameters.angle 
            // angles = - (angles + Math.PI / 2)
            angles = - (angles + 3)
            this.parameters.angles.push(angles)

            // Position
            const cleanMiddle = 0.6
            let positionX
            do { positionX = (Math.random() - 0.5) * 2
            } while (positionX >= -cleanMiddle && positionX <= cleanMiddle)
            positionX *= (this.parameters.stationWidth / 2 - this.parameters.worksSize / 2)
            
            const positionY = Math.sin(angles) * this.parameters.billBoardRadius
            const positionZ = Math.cos(angles) * this.parameters.billBoardRadius

            const boxY = Math.sin(angles) * this.parameters.boxRadius
            const boxZ = Math.cos(angles) * this.parameters.boxRadius

            this.parameters.positionX.push(positionX)
            this.parameters.positionY.push(positionY)
            this.parameters.positionZ.push(positionZ)

            this.parameters.boxY.push(boxY)
            this.parameters.boxZ.push(boxZ)

            // Rotation
            const rotateX = - angles - Math.PI / 2
            const rotateY = Math.random() * Math.PI * 2
            const rotateZ = Math.random() * Math.PI * 2
            this.parameters.rotationX.push(rotateX)
            this.parameters.rotationY.push(rotateY)
            this.parameters.rotationZ.push(rotateZ)
        }
    }
    updateWorks()
    {
        this.disposeWorks()
        this.setGroup()
        this.setImages()
        this.setBoxes()
    }
    disposeWorks()
    {
        this.scene.remove(this.group)
        
        this.group.remove(this.SpaseStationMesh)
        this.group = null

        this.worksMesh.geometry.dispose()
        this.worksMesh.material.dispose()
        this.worksMesh = null

        this.worksMaterial.dispose()
        this.worksMaterial = null

        this.worksPlaneGeometry.dispose()
        this.worksPlaneGeometry = null
    }
    setGroup()
    {
        this.group = new THREE.Group()
        this.group.name = ('Works')
        this.scene.add(this.group)
    }
    setImages()
    {
        this.worksPlaneGeometry = new THREE.PlaneGeometry(
            this.parameters.worksSize,
            this.parameters.worksSize)
        
        this.imagesArray = []
        for(let i=0; i < this.textures.length; i++)
        {
            // 1. Material
            this.texture = this.textures[i]
            this.worksMaterial = new THREE.MeshBasicMaterial({ 
                map: this.texture,
                side: THREE.DoubleSide })

            // 2. Mesh
            this.worksMesh = new THREE.Mesh( this.worksPlaneGeometry, this.worksMaterial )
            this.worksMesh.name = i;
            
            // 3. Position
            this.worksMesh.position.x = this.parameters.positionX[i]
            this.worksMesh.position.y = this.parameters.positionY[i]
            this.worksMesh.position.z = this.parameters.positionZ[i]

            // 4. Rotate
            this.worksMesh.rotation.x = this.parameters.rotationX[i]

            // 5. Add to group
            this.imagesArray.push(this.worksMesh)
            this.group.add(this.worksMesh)
        }        
    }
    setRaycaster()
    {
        this.rayOrigin = new THREE.Vector3(-0.25,-2.3,0)
        this.rayDirection = new THREE.Vector3(0,0,-1)
        this.rayDirection.normalize()

        this.raycaster = new THREE.Raycaster()  

        // this.arrowHelper = new THREE.ArrowHelper(this.rayDirection, this.rayOrigin, 5, 0xff0000);
        // this.scene.add(this.arrowHelper);

        this.currentIntersect = null




        // Handle mouse click
        window.addEventListener('click', this.onRaycasterClick.bind(this));

        // Handle touch start
        // window.addEventListener('touchstart', this.onRaycasterClick.bind(this));
        // window.addEventListener('touchend', this.onRaycasterClick.bind(this));




        // window.addEventListener
        // (
        //     'click', () =>
        //     {
        //         if(this.currentIntersect)
        //         {
        //             console.log('clicked on :' , this.currentIntersect.object.name)
        //             if(this.currentIntersect.object.name === 0){window.open('https://jmayerh.de/astana-expo-2017/', '_blank')}
        //             if(this.currentIntersect.object.name === 1){window.open('https://jmayerh.de/extension-on-top-of-the-kleine-grosz-museum-at-tankstelle-bulowstrasse/', '_blank')}
        //             if(this.currentIntersect.object.name === 2){window.open('https://jmayerh.de/pavilion-on-europaplatz/', '_blank')}
        //             if(this.currentIntersect.object.name === 3){window.open('https://jmayerh.de/tram-stop/', '_blank')}
        //             if(this.currentIntersect.object.name === 4){window.open('http://moscase.com', '_blank')}
        //             if(this.currentIntersect.object.name === 5){window.open('http://moscase.com', '_blank')}
        //             if(this.currentIntersect.object.name === 6){window.open('https://jmayerh.de/n-n-residence-near-moscow/', '_blank')}
        //             if(this.currentIntersect.object.name === 7){window.open('https://jmayerh.de/pavilion-ka300/', '_blank')}
        //             if(this.currentIntersect.object.name === 8){window.open('https://jmayerh.de/house-of-prayer-and-learning/', '_blank')}
        //             if(this.currentIntersect.object.name === 9){window.open('https://www.instagram.com/superb.berlin/', '_blank')}
        //             if(this.currentIntersect.object.name === 10){window.open('https://jmayerh.de/raw/', '_blank')}
        //             if(this.currentIntersect.object.name === 11){window.open('https://jmayerh.de/zipper-rkm-740/', '_blank')}
        //             if(this.currentIntersect.object.name === 12){window.open('https://jmayerh.de/table-tennis-table/?n=1861', '_blank')}
        //             if(this.currentIntersect.object.name === 13){window.open('https://jmayerh.de/strukturalien/', '_blank')}
        //             if(this.currentIntersect.object.name === 14){window.open('https://www.instagram.com/superb.berlin/', '_blank')}
        //             if(this.currentIntersect.object.name === 15){window.open('https://www.youtube.com/watch?v=hs4sur3MTwM&t=12s', '_blank')}
        //         }
        //     }
        // )
    }
    onRaycasterClick()
    {
        // Ignore station clicks while Works is active, so portfolio clicks do not also trigger background objects.
        if (this.experience.works?.active) return

        // Handle a click on the intersected station object.
        if(this.currentIntersect)
        {
            console.log('clicked on :' , this.currentIntersect.object.name)
            if(this.currentIntersect.object.name === 0){window.open('https://jmayerh.de/astana-expo-2017/', '_blank')}
            if(this.currentIntersect.object.name === 1){window.open('https://jmayerh.de/extension-on-top-of-the-kleine-grosz-museum-at-tankstelle-bulowstrasse/', '_blank')}
            if(this.currentIntersect.object.name === 2){window.open('https://jmayerh.de/pavilion-on-europaplatz/', '_blank')}
            if(this.currentIntersect.object.name === 3){window.open('https://jmayerh.de/tram-stop/', '_blank')}
            if(this.currentIntersect.object.name === 4){window.open('http://moscase.com', '_blank')}
            if(this.currentIntersect.object.name === 5){window.open('http://moscase.com', '_blank')}
            if(this.currentIntersect.object.name === 6){window.open('https://jmayerh.de/n-n-residence-near-moscow/', '_blank')}
            if(this.currentIntersect.object.name === 7){window.open('https://jmayerh.de/pavilion-ka300/', '_blank')}
            if(this.currentIntersect.object.name === 8){window.open('https://jmayerh.de/house-of-prayer-and-learning/', '_blank')}
            if(this.currentIntersect.object.name === 9){window.open('https://www.instagram.com/superb.berlin/', '_blank')}
            if(this.currentIntersect.object.name === 10){window.open('https://jmayerh.de/raw/', '_blank')}
            if(this.currentIntersect.object.name === 11){window.open('https://jmayerh.de/zipper-rkm-740/', '_blank')}
            if(this.currentIntersect.object.name === 12){window.open('https://jmayerh.de/table-tennis-table/?n=1861', '_blank')}
            if(this.currentIntersect.object.name === 13){window.open('https://jmayerh.de/strukturalien/', '_blank')}
            if(this.currentIntersect.object.name === 14){window.open('https://www.instagram.com/superb.berlin/', '_blank')}
            if(this.currentIntersect.object.name === 15){window.open('https://www.youtube.com/watch?v=hs4sur3MTwM&t=12s', '_blank')}
        }
    }
    setBoxes()
    {
        /**
         * 1. Geometry
         */
        this.BoxGeometryArray = []
        for(let i=0; i < this.textures.length; i++)
        {
            // 1.1 Geometries
            const geometry = new THREE.BoxGeometry(
                this.parameters.worksSize,
                this.parameters.boxHeight,
                this.parameters.worksCellSize * 2,
                this.parameters.worksSize / this.parameters.worksCellSize,
                this.parameters.boxHeight / this.parameters.worksCellSize,
                2)

            // 1.2 Rotations
            geometry.rotateX(this.parameters.rotationX[i])

            // 1.3 Positions
            const x = this.parameters.positionX[i]
            const y = this.parameters.boxY[i]
            const z = this.parameters.boxZ[i]
            geometry.translate(x,y,z)

            // 1. Array
            this.BoxGeometryArray.push(geometry)
        }
        // 1. Merge
        this.mergedBoxGeometry = BufferGeometryUtils.mergeGeometries(this.BoxGeometryArray)
        /**
         * 2. Material
         */
        this.BoxMaterial = new THREE.MeshNormalMaterial({wireframe:true})
        /**
         * Mesh
         */
        this.boxMesh = new THREE.Mesh(this.mergedBoxGeometry, this.BoxMaterial)
        this.group.add(this.boxMesh)
    }
    setDebug()
    {
        if(this.debug.active)
        {
            this.debugFoloder = this.debug.ui.addFolder('Works')
            this.debugFoloder.close()
            
            this.debugFoloder.add(this.parameters, 'worksSize', 0.01, 1, 0.01)
                .onChange( () => {this.updateWorks()} )
            this.debugFoloder.add(this.parameters, 'worksCellSize', 0.01, 0.5, 0.01)
                .onChange( () => {this.updateWorks()} )
        }
    }
    update()
    {
        this.group.rotation.x = - this.time.elapsed * this.rotationSpeed

        /**
         * Raycaster
         */

        this.raycaster.setFromCamera(this.mouse, this.camera)
        this.intersects = this.raycaster.intersectObjects(this.imagesArray)
        
        // reset color
        for(const image of this.imagesArray)
        {
            image.material.color.set('#ffffff')
        }

        // mouse in / out
        if(this.intersects.length)
        {

            // if(this.currentIntersect === null) { console.log('mouse enter', this.intersects[0].object.name) }
            this.currentIntersect = this.intersects[0]
            this.currentIntersect.object.material.color.set('#ffbb22')
        }
        else
        {
            // if(this.currentIntersect){console.log('mosue leave')}
            this.currentIntersect = null
        }
    }
}