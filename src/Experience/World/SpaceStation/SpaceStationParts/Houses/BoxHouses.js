import * as THREE from 'three'

export default class BoxHouses
{
    constructor
    (
        amountOfHouses,
        stationRadius,
        stationWidth,
        valleyWidth,
        houseWidth,
        houseMaxHeight,
        geometryArray
    )
    {
        // Parameters corrections
        amountOfHouses *= (1-valleyWidth) // reduce amount accorting to the valley width valley

        for(let i=0; i < amountOfHouses; i++)
        {
            // 1. Parameters
            const angle = Math.random() * Math.PI * 2
            const houseScale = Math.random() * houseMaxHeight
            const radius = stationRadius - houseScale / 2

            // 2. Geometries
            const houseGeometry = new THREE.BoxGeometry(
                houseWidth,
                houseWidth,
                houseScale)

            // 3. Rotations
            houseGeometry.rotateX( - angle)

            // 4. Positions
            let x
            do { x = (Math.random() - 0.5) * 2 * (stationWidth / 2)
            } while (x >= - valleyWidth && x <= valleyWidth)
            const y = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius
            houseGeometry.translate(x,y,z)

            // 5. Push
            geometryArray.push(houseGeometry)
        }
    }
}