import * as THREE from 'three'
import flyTo from './flyTo.js'
import flyToAvenue from './flyToAvenue.js'

// Own the whole camera visit: approach a billboard, follow it as the ring turns, and return to avenue.
// The world file handles boards and website clicks. State.js chooses trips and manages input and the button.
export default class BillboardAnimation
{
    // Prepare the camera and remember the current visit in one place.
    constructor(experience)
    {
        this.camera = experience.camera.instance
        this.controls = experience.camera.controls
        this.stationParameters = experience.world.spaceStation.parameters
        // No billboard is selected at home. Keep the selection until Back reaches avenue.
        this.selectedBillboard = null
        // An invisible viewpoint can ride with the ring while the real camera stays in the main scene.
        // Animating this viewpoint lets us approach a board that is still moving.
        this.cameraView = new THREE.Object3D()
    }

    // Visit the board already selected by the click handler, and follow it as the ring keeps turning.
    // State.js only asks us to enter; it does not need to know which board was clicked.
    enter(complete)
    {
        const billboard = this.selectedBillboard
        // An unattached viewpoint means we are starting a visit, rather than moving between boards.
        const isFirstBillboardVisit = this.cameraView.parent === null
        if(isFirstBillboardVisit)
        {
            // Start the viewpoint exactly where the camera is now. The board's parent is the rotating group.
            // attach() puts the viewpoint inside that group without changing its visible position.
            this.cameraView.position.copy(this.camera.position)
            this.cameraView.quaternion.copy(this.camera.quaternion)
            billboard.parent.attach(this.cameraView)
        }

        // Report arrival after the approach. Following the ring continues in update().
        flyToBillboard(this.camera, billboard, this.cameraView, complete)
    }

    // Leave the billboard visit and fly to the same avenue view where the intro finishes.
    // Stop following first; once we reach avenue, close the visit and tell the caller we arrived.
    exit(complete)
    {
        // Leave the ring at the camera's current visible position before flying to avenue.
        this.cameraView.removeFromParent()
        // Use the same return journey as Works; the helper also clears leftover mouse movement.
        flyToAvenue(this.camera, this.controls, this.stationParameters, () =>
        {
            // Clear the selected object before reporting that we have reached station.
            this.selectedBillboard = null
            complete()
        })
    }

    // Keep the real camera with the moving billboard during the approach and after arrival.
    // The world file calls this after rotating the ring, before checking which board is under the mouse.
    update()
    {
        // cameraView is an invisible marker that moves with the ring.
        // The flight moves this marker toward the chosen board; after arrival it stays in front of it.
        // Make the real camera follow the marker every frame, so the board stays in front of us.
        // Back removes the marker from the ring, so following stops before the return flight begins.
        const shouldFollowBillboard = this.cameraView.parent !== null
        if(shouldFollowBillboard)
        {
            // Move the real camera to the marker's position, including the ring's rotation.
            this.cameraView.getWorldPosition(this.camera.position)
            // Turn and tilt the camera to match the marker, keeping the billboard upright in our view.
            this.cameraView.getWorldQuaternion(this.camera.quaternion)
        }
        // Update Three.js's record of the camera's position and direction before checking mouse hover.
        // Otherwise the highlight and hand cursor could use where the camera was before it moved.
        this.camera.updateMatrixWorld()
    }
}

// Fly the camera to the chosen billboard and show it upright, with space around its edges.
// cameraView is an invisible viewpoint carried by the ring; the real camera follows it each frame.
// Moving this viewpoint toward the board lets the whole ring keep turning during the flight.
function flyToBillboard(camera, billboard, cameraView, complete)
{
    // Measure the board inside the ring's group, where both the board and cameraView live.
    // Their positions relative to the ring stay useful even while the ring turns.
    billboard.updateMatrix()
    billboard.geometry.computeBoundingBox()
    const center = billboard.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(billboard.matrix)
    const normal = new THREE.Vector3().fromBufferAttribute(billboard.geometry.attributes.normal, 0)
        .applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(billboard.matrix))
    // Approach from the side we are already viewing instead of flying through the board.
    const isViewingBackOfBillboard = normal.dot(cameraView.position.clone().sub(center)) < 0
    if(isViewingBackOfBillboard) normal.negate()

    // Use the billboard's own top edge to keep it upright around the whole ring.
    const up = new THREE.Vector3(0, 1, 0).transformDirection(billboard.matrix)
    const size = billboard.geometry.boundingBox.getSize(new THREE.Vector3())
        .multiply(billboard.scale)
    // Choose enough distance to fit the board within 45% of the view's width and height.
    // Account for a narrow phone screen as well as a wide screen, and for camera zoom.
    const distance = Math.max(size.y, size.x / camera.aspect) /
        (2 * Math.tan(THREE.MathUtils.degToRad(camera.getEffectiveFOV() / 2)) * 0.45)
    const position = center.clone().addScaledVector(normal, distance)
    // A quaternion stores the camera's facing direction and tilt together.
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(position, center, up)
    )

    // Use the shared flight to move the viewpoint; following the ring continues after arrival.
    return flyTo(cameraView, position, quaternion, complete)
}
