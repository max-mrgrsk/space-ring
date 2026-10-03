import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default class StackedHouses
{
    constructor
    (
        amountOfHouses,
        stationRadius,
        valleyWidth,
        houseWidth,
        houseMaxHeight,
        geometryArray,
        meshGeometryArray
    )
    {

        // Parameters corrections
        const stripWidth = 0.05
        amountOfHouses *= 0.04 // reduce amount accorting to the valley width valley
        const streetWidth = valleyWidth - stripWidth



        for(let i=0; i < amountOfHouses; i++)
        {
            /**
             * 1. Parameters
             */
            const angle = Math.random() * Math.PI * 2

            let houseHeight = (1 + Math.random())/2 * houseMaxHeight // randomize height
            const amountOfFloors = Math.round(houseHeight * 10) // calculate amount of floors per house
            const floorHeight = houseHeight / amountOfFloors
            houseHeight = floorHeight * amountOfFloors
            const radius = stationRadius
            const towerHeight = 0.03
            const cylinderHeight = 0.03


            /**
             * 2. Geometries
             */
            // 2.1 Slab geometry
            const geometries = []
            for(let i=0; i<amountOfFloors; i++)
            {
                const box = new THREE.BoxGeometry(
                    houseWidth * 0.5 + houseWidth / (i+1),
                    houseWidth * 0.5 + houseWidth / (i+1),
                    floorHeight)
                const x = (Math.random() - 0.5) * 0.03
                const y = (Math.random() - 0.5) * 0.05
                const z = - i * floorHeight - (floorHeight / 2)
                box.translate(x,y,z)
                geometries.push(box)
            }
            const slabGeometry = BufferGeometryUtils.mergeGeometries(geometries)
            // 2.2 TowerGeometry
            const towerGeometry = new THREE.BoxGeometry(
                0.02,
                0.02,
                towerHeight
            )
            // 2.3 CylinderGeometry
            const cylinderGeometry = new THREE.CylinderGeometry(
                0.015,0.015,
                cylinderHeight,8
            )

            /**
             * 3. Rotations
             */
            slabGeometry.rotateX( - angle)
            towerGeometry.rotateX( - angle)
            cylinderGeometry.rotateX( - angle + Math.PI / 2)

            /**
             * 4. Positions
             */
            let x
            do { x = (Math.random() - 0.5) * 2 * valleyWidth
            } while (x >= - streetWidth && x <= streetWidth)
            const y = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius
            slabGeometry.translate(x,y,z)
            // 4.2 Tower Position
            towerGeometry.translate(
                x,
                Math.sin(angle) * (radius - houseHeight - towerHeight/2),
                Math.cos(angle) * (radius - houseHeight - towerHeight/2))
            cylinderGeometry.translate(
                x,
                Math.sin(angle) * (radius - houseHeight - towerHeight/2 - cylinderHeight),
                Math.cos(angle) * (radius - houseHeight - towerHeight/2 - cylinderHeight))

            /**
             * 5. Push
             */
            geometryArray.push(
                slabGeometry,
                cylinderGeometry)
            meshGeometryArray.push(towerGeometry)
        }
    }
}
