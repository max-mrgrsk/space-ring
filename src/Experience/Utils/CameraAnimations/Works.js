import gsap from 'gsap'

export default function animateWorksCamera(camera, position, quaternion, complete)
{
    const startPosition = camera.position.clone()
    const startQuaternion = camera.quaternion.clone()
    const progress = { value: 0 }

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
