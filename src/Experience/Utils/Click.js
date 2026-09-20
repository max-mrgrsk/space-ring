// Recognize deliberate clicks or taps on an element without triggering its action after a drag.
// The caller decides what a click does and can temporarily disable clicks with canClick.
export default function onClick(element, handleClick, canClick = () => true)
{
    let tap = null

    // 1. PRESS: remember where the mouse or finger was pressed, without acting yet.
    // Why: both clicking and dragging start with a press; we cannot tell them apart yet.
    const onPointerDown = event =>
    {
        if(tap)
        {
            // Another finger means a gesture such as pinching, so cancel the possible click.
            tap.moved = true
            return
        }
        // Track only the left mouse button or primary finger, while clicks are allowed.
        if(!canClick() || event.button !== 0 || !event.isPrimary) return
        tap = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
    }

    // 2. MOVE: remember whether the press has become a drag.
    // Allow 6 pixels of hand movement so a slightly shaky click still works.
    const onPointerMove = event =>
    {
        if(tap?.id === event.pointerId)
        {
            // Once it is a drag, moving back to the starting point must not turn it into a click.
            tap.moved ||= Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 6
        }
    }

    // 3. RELEASE: perform the click action only if the whole gesture was a click.
    // Example: press, drag the view, then release should move the view without opening a link.
    const onPointerUp = event =>
    {
        // Only the pointer that started the press can finish it.
        if(tap?.id !== event.pointerId) return
        const finished = tap
        tap = null
        // Check the final position too, in case the last movement had no separate move event.
        if(canClick() && !finished.moved && Math.hypot(event.clientX - finished.x, event.clientY - finished.y) <= 6)
        {
            handleClick(event)
        }
    }

    // Forget an unfinished press if it is interrupted or the pointer leaves the element.
    const cancel = () => tap = null
    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointercancel', cancel)
    element.addEventListener('lostpointercapture', cancel)
    element.addEventListener('pointerleave', cancel)

    // If the caller removes this interaction later, this function removes its listeners too.
    return () =>
    {
        cancel()
        element.removeEventListener('pointerdown', onPointerDown)
        element.removeEventListener('pointermove', onPointerMove)
        element.removeEventListener('pointerup', onPointerUp)
        element.removeEventListener('pointercancel', cancel)
        element.removeEventListener('lostpointercapture', cancel)
        element.removeEventListener('pointerleave', cancel)
    }
}
