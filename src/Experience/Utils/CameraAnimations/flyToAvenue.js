import * as THREE from 'three'
import flyTo from './flyTo.js'
import { avenue } from './namedViews.js'

// Fly back to the avenue view where the intro finishes, and prepare mouse controls for that view.
// Works and billboards finish closing on arrival; the state manager then applies the station recipe.
export default function flyToAvenue(camera, controls, stationParameters, complete)
{
    const avenueView = avenue(stationParameters)
    // Turn the avenue's look-at point into a facing direction for the camera animation.
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(avenueView.position, avenueView.target, camera.up)
    )

    return flyTo(camera, avenueView.position, quaternion, () =>
    {
        // Disabled mouse controls still remember the glide from an earlier drag.
        // Turn smoothing off for one update to clear it, then back on for normal mouse movement.
        controls.enableDamping = false
        controls.update()
        controls.enableDamping = true
        // That clearing update can move the camera. Put it back at avenue before drawing the next frame,
        // and give the controls the same look-at point so they keep this view when they resume.
        camera.position.copy(avenueView.position)
        camera.quaternion.copy(quaternion)
        controls.target.copy(avenueView.target)
        // The camera is ready. Let the caller finish closing its objects and report arrival.
        complete()
    })
}
