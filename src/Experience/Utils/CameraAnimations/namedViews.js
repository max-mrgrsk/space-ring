// Named camera views, like saved viewpoints in CAD.
// position is where the camera sits; target is the point it looks at.
// These describe destinations. The camera animations handle travelling to them.

// Describe the avenue view inside the ring, where the intro finishes.
// Calculate its height from the station and house sizes so it follows the rooftop height.
export function avenue(parameters)
{
    const roofTopRadius = parameters.stationRadius - parameters.houseMaxHeight
    const flightHeight = - 0.05
    const cameraHeight = - roofTopRadius + flightHeight

    return {
        position: { x: 0, y: cameraHeight, z: 0.03 },
        target: { x: 0, y: cameraHeight, z: 0 }
    }
}
