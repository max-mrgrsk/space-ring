import * as THREE from 'three'
import Experience from '../../Experience'
import onClick from '../../Utils/Click.js'
import pickObject from '../../Utils/PickObject.js'
import BillboardAnimation from '../../Utils/CameraAnimations/Billboards.js'

// mesh merger
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Builds and rotates the billboard objects, and handles clicks, links and the Back button.
// CameraAnimations/Billboards.js owns the complete camera visit, including following and returning.
export default class Billboards
{
    // Build the billboards and prepare their clicks, camera flights and Back button.
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
        this.setNavigation()
        this.setBoxes()
        this.setDebug()
    }
    setTextures()
    {
        this.resources = this.experience.resources
        // Only texture entries with a website link become billboards.
        // Read the same sources used by the loader, so each image stays paired with its link.
        this.billboardSources = this.resources.sources.filter(source => source.type === 'texture' && source.url)
        this.textures = this.billboardSources.map(source => this.resources.items[source.name])

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
        // Build each board from its own entry; i is only used to place it around the ring.
        for(const [i, billboard] of this.billboardSources.entries())
        {
            // 1. Material
            this.texture = this.resources.items[billboard.name]
            this.worksMaterial = new THREE.MeshBasicMaterial({ 
                map: this.texture,
                side: THREE.DoubleSide })

            // 2. Mesh
            this.worksMesh = new THREE.Mesh( this.worksPlaneGeometry, this.worksMaterial )
            this.worksMesh.name = billboard.name;
            // Keep the website on the board itself, so opening it never depends on a list position.
            this.worksMesh.userData.url = billboard.url
            
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
    // Prepare to find the billboard under the mouse and respond to deliberate clicks or taps.
    // Dragging the view must not accidentally select a board.
    setRaycaster()
    {
        this.rayOrigin = new THREE.Vector3(-0.25,-2.3,0)
        this.rayDirection = new THREE.Vector3(0,0,-1)
        this.rayDirection.normalize()

        this.raycaster = new THREE.Raycaster()  

        // this.arrowHelper = new THREE.ArrowHelper(this.rayDirection, this.rayOrigin, 5, 0xff0000);
        // this.scene.add(this.arrowHelper);

        this.currentIntersect = null




        // A deliberate click or tap visits a billboard, or opens the one already being viewed.
        // The shared helper ignores drags and pinches; Works and camera flights disable clicks.
        onClick(this.experience.canvas, event => this.onRaycasterClick(event), () => this.canPick)

        // Handle touch start
        // window.addEventListener('touchstart', this.onRaycasterClick.bind(this));
        // window.addEventListener('touchend', this.onRaycasterClick.bind(this));




    }
    // Decide what a billboard click should do: visit a new board, or open the website of the one we are viewing.
    // Example: the first click flies to the board; a separate click after arrival opens its website.
    onRaycasterClick(event)
    {
        // Use the shared picker so mouse clicks and finger taps find the board at this position.
        const hit = pickObject({
            x: event.clientX,
            y: event.clientY,
            canvas: this.experience.canvas,
            camera: this.camera,
            root: this.group,
            objects: this.imagesArray
        })
        if(!hit) return

        // Only the board we are already viewing can open a website.
        // The click helper blocks clicks during a flight, so arrival alone never opens a tab.
        const clickedSelectedBillboard = hit.object === this.cameraAnimation.selectedBillboard
        if(clickedSelectedBillboard)
        {
            // Read the link belonging to this board, even if the data list has been reordered.
            const url = hit.object.userData.url
            if(url) window.open(url, '_blank')
            return
        }

        // Clicking any other board flies there first; its website needs a separate click.
        this.cameraAnimation.focusBillboard(hit.object)
        this.button.textContent = '<back'
        this.experience.canvas.style.cursor = ''
    }

    // Prepare the camera visit and connect the Back button to its return journey.
    // The animation owns the camera movement; this file owns the button and its label.
    setNavigation()
    {
        this.cameraAnimation = new BillboardAnimation(this.experience)
        // Reuse the existing .works button; it will show Back while we are visiting billboards.
        this.button = document.querySelector('#works-toggle')
        // This button already has a Works click handler. A Back click must return home without opening Works.
        // The final true below makes this handler run before the normal Works click handler.
        this.button.addEventListener('click', event =>
        {
            // At home, leave the click alone so the button can open Works as usual.
            if(!this.cameraAnimation.active) return
            // During a billboard visit, stop this click from also reaching the Works handler.
            event.stopImmediatePropagation()
            this.experience.canvas.style.cursor = ''
            // Ask the animation to return to avenue. Change the button label only after arrival.
            this.cameraAnimation.exit(() =>
            {
                this.button.textContent = '.works'
            })
        }, true)
    }

    // Decide whether a click may visit a billboard or open its website right now.
    // Wait for any camera flight to finish, and let Works handle clicks while it is open.
    get canPick()
    {
        return !this.experience.works?.active && !this.cameraAnimation.flight
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
    // Keep the boards aligned with the rotating ring and highlight the one under the mouse.
    // Show a hand cursor when that board can be clicked.
    update()
    {
        this.group.rotation.x = - this.time.elapsed * this.rotationSpeed
        // Recalculate the boards' positions after the ring turns, before following a board or checking hover.
        this.group.updateMatrixWorld(true)
        // Let the camera animation follow the moving board, then check hover using the updated view.
        this.cameraAnimation.update()

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

        // A hand shows that the billboard is clickable; empty space uses the normal cursor.
        // Let Works control its own cursor while open, including its camera transitions.
        if(!this.experience.works?.active)
        {
            // Flights temporarily disable clicks, so hide the hand until the camera arrives.
            const showHandCursor = this.canPick && this.currentIntersect
            this.experience.canvas.style.cursor = showHandCursor ? 'pointer' : ''
        }
    }
}