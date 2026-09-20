import gsap from 'gsap'

// Fly smoothly from the camera's current view to the destination chosen by the caller.
// position says where to go; quaternion says which way to face, including tilt.
// complete runs when we arrive, so the caller can finish its transition.
export default function flyTo(camera, position, quaternion, complete)
{
    const startPosition = camera.position.clone()
    const startQuaternion = camera.quaternion.clone()
    const progress = { value: 0 }

    // Return the running animation so the caller can stop it before starting another flight.
    return gsap.to(progress,
    {
        value: 1,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () =>
        {
            camera.position.lerpVectors(startPosition, position, progress.value)
            camera.quaternion.slerpQuaternions(startQuaternion, quaternion, progress.value)
        },
        onComplete: complete
    })
}
