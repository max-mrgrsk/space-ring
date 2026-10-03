import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default class SlabHouses
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
        amountOfHouses *= 0.06 // reduce amount accorting to the valley width valley
        const streetWidth = valleyWidth - stripWidth



        for(let i=0; i < amountOfHouses; i++)
        {
            /**
             * 1. Parameters
             */
            const angle = Math.random() * Math.PI * 2

            let houseHeight = (1 + Math.random())/2 * houseMaxHeight // randomize height
            const amountOfFloors = Math.round(houseHeight * 60) // calculate amount of floors per house
            const floorHeight = houseHeight / amountOfFloors
            houseHeight = amountOfFloors * floorHeight
            const radius = stationRadius


            /**
             * 2. Geometries
             */
            // 2.1 Slab geometry
            const geometries = []
            for(let i=0; i<amountOfFloors; i++)
            {
                const box = new THREE.BoxGeometry(houseWidth,houseWidth,0.003)
                const x = (Math.random() - 0.5) * 0.03
                const y = (Math.random() - 0.5) * 0.03
                const z = - i * floorHeight
                box.translate(x,y,z)
                geometries.push(box)
            }
            const slabGeometry = BufferGeometryUtils.mergeGeometries(geometries)
            // 2.2 Facade geometry
            const facadeGeometry = new THREE.BoxGeometry(
                houseWidth * 0.7,
                houseWidth * 0.7,
                (amountOfFloors - 1) * floorHeight, // height
                5,
                5,
                amountOfFloors - 1)

            /**
             * 3. Rotations
             */
            slabGeometry.rotateX( - angle)
            facadeGeometry.rotateX( - angle)

            /**
             * 4. Positions
             */
            let x
            do { x = (Math.random() - 0.5) * 2 * valleyWidth
            } while (x >= - streetWidth && x <= streetWidth)
            const y = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius
            const facadeY = Math.sin(angle) * (radius - houseHeight / 2 + floorHeight / 2)
            const facadeZ = Math.cos(angle) * (radius - houseHeight / 2 + floorHeight / 2)
            slabGeometry.translate(x,y,z)
            facadeGeometry.translate(x,facadeY,facadeZ)

            /**
             * 5. Push
             */
            geometryArray.push(slabGeometry)
            meshGeometryArray.push(facadeGeometry)
        }
    }
}
