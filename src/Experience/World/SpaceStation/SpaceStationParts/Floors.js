import * as THREE from 'three'

export default class Floors
{
    constructor
    (
        amountOfFloors,
        stationRadius,
        stationWidth,
        floorHeight,
        geometryArray
    )
    {
        for(let i=0; i < amountOfFloors; i++)
        {
            // 1. Parameters
            const angle = Math.random() * Math.PI * 2

            const radius = stationRadius + floorHeight / 2

            // 2. Geometries
            const floorGeometry = new THREE.BoxGeometry(
                stationWidth,
                stationWidth / 2,
                floorHeight)

            // 3. Rotations
            floorGeometry.rotateX( - angle)

            // 4. Positions
            const x = 0
            const y = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius
            floorGeometry.translate(x,y,z)

            // 6. Push
            geometryArray.push(floorGeometry)
        }
    }
}
