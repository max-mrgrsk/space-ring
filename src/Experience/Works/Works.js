import * as THREE from 'three'
import gsap from 'gsap'
import flyTo from '../Utils/CameraAnimations/flyTo.js'
import flyToAvenue from '../Utils/CameraAnimations/flyToAvenue.js'
import pickObject from '../Utils/PickObject.js'
import createModels from './createModels.js'
import createMascot from './createMascot.js'
import createCategories from './categories.js'
import createLabelTexture from './labels.js'
import { VIEW, getLabelLayout, getModelLayout } from './layout.js'

const scrollStep = VIEW.scrollStep

export default class Works
{
    constructor(experience)
    {
        // Setup
        this.experience = experience
        this.camera = experience.camera.instance
        this.controls = experience.camera.controls
        this.canvas = experience.canvas

        // Scroll position within the portfolio
        this.targetScroll = 0
        this.scroll = 0
        this.section = -1

        // Scene root
        // One container for all Works models and labels, so they move and hide together.
        this.root = new THREE.Group()
        // Match the settled intro view: camera at z=0.03 looks forward along -Z.
        // Move the presentation in front of that view, rather than turning toward the sun.
        this.root.position.set(0, 0, VIEW.presentationZ)
        experience.scene.add(this.root)

        // Models
        this.models = createModels()
        const mascot = createMascot(this.models.material)

        // Labels
        this.narrow = this.camera.aspect < 1

        this.cards = createCategories({ engineering: mascot, ...this.models }).map((category, index) =>
        {
            // Card container and model
            const group = new THREE.Group()
            group.add(category.model)

            // 3D text label
            const label = new THREE.Mesh(
                new THREE.PlaneGeometry(1, 1),
                new THREE.MeshBasicMaterial(
                {
                    map: createLabelTexture(category, this.narrow),
                    transparent: true,
                    toneMapped: false,
                    depthTest: false,
                    depthWrite: false
                })
            )
            label.renderOrder = 100
            label.userData.index = index
            group.add(label)

            // Add the card to the Works root
            this.root.add(group)

            // Assembled card references
            return { ...category, group, label }
        })

        // Pointer picking
        // Find which 3D label the pointer is over, for the hand cursor and link clicks.
        this.labels = this.cards.map(card => card.label)

        // Scrolling
        window.addEventListener('wheel', event =>
        {
            if(!this.canScroll)
            {
                return
            }

            event.preventDefault()
            const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1)
            this.move(pixels / innerHeight * scrollStep)
        }, { passive: false })

        // Dragging and link activation
        // Start tracking a drag or tap. Scrolling can stay on even when website clicks are off.
        this.canvas.addEventListener('pointerdown', event =>
        {
            const canUsePointer = this.canScroll || this.canInteract
            if(!canUsePointer || event.button !== 0)
            {
                return
            }

            this.canvas.style.cursor = ''
            event.preventDefault()
            if(this.drag)
            {
                // Additional fingers must not turn the gesture into a link tap.
                this.drag.moved = true
                return
            }
            if(event.pointerType === 'touch' && !event.isPrimary)
            {
                return
            }

            this.drag = {
                id: event.pointerId,
                y: event.clientY,
                startX: event.clientX,
                startY: event.clientY,
                moved: false
            }
            this.canvas.setPointerCapture(event.pointerId)
        })

        // Scroll the objects and distinguish a drag from a tap.
        this.canvas.addEventListener('pointermove', event =>
        {
            if(event.pointerType === 'mouse')
            {
                this.pointerClient = { x: event.clientX, y: event.clientY }
            }
            if(!this.drag || this.drag.id !== event.pointerId)
            {
                return
            }

            const dy = this.drag.y - event.clientY
            this.drag.moved ||= Math.hypot(event.clientX - this.drag.startX, event.clientY - this.drag.startY) > 6
            this.drag.y = event.clientY
            if(this.canScroll)
            {
                this.move(dy / innerHeight * scrollStep)
            }
        })

        // Finish the gesture and open a link only for a tap.
        this.canvas.addEventListener('pointerup', event =>
        {
            if(!this.drag || this.drag.id !== event.pointerId)
            {
                return
            }

            const click = !this.drag.moved &&
                Math.hypot(event.clientX - this.drag.startX, event.clientY - this.drag.startY) <= 6
            this.drag = null
            if(this.canvas.hasPointerCapture(event.pointerId))
            {
                this.canvas.releasePointerCapture(event.pointerId)
            }
            if(click && this.canInteract)
            {
                this.openLabel(event)
            }
        })

        // Clear an interrupted gesture when it is cancelled or loses capture.
        const cancelDrag = event =>
        {
            if(!this.drag || this.drag.id !== event.pointerId)
            {
                return
            }

            this.drag = null
            this.canvas.style.cursor = ''
        }
        this.canvas.addEventListener('pointercancel', cancelDrag)
        this.canvas.addEventListener('lostpointercapture', cancelDrag)

        // Clear the hover cursor when the pointer leaves.
        this.canvas.addEventListener('pointerleave', () =>
        {
            this.pointerClient = null
            this.canvas.style.cursor = ''
        })

        // Initial layout
        this.resize()
    }

    // Use the dashboard's click setting. Hidden Works labels must never open a website.
    get canInteract()
    {
        return this.root.visible && this.experience.stateManager.settings.works.clickable
    }

    // Scroll mode moves the Works objects with a wheel or drag, while camera rotation stays disabled.
    get canScroll()
    {
        return this.root.visible && this.experience.stateManager.settings.controls === 'scroll'
    }

    // Responsive layout
    resize()
    {
        const labelLayout = getLabelLayout(this.camera.aspect, this.camera.fov, this.experience.sizes.height)
        const modelLayout = getModelLayout(this.camera.aspect, this.camera.fov, this.cards)

        this.cards.forEach((card, index) =>
        {
            const layout = modelLayout[index]
            card.offset = layout.offset
            card.group.position.y = -card.offset
            card.model.position.set(layout.x, 0, 0)
            card.model.scale.setScalar(layout.scale)

            // Labels stay centered in front of the models. Overlap is intentional.
            card.label.position.set(0, 0, labelLayout.z)
            card.label.scale.set(labelLayout.width, labelLayout.height, 1)
            if(this.narrow !== labelLayout.narrow)
            {
                card.label.material.map.dispose()
                card.label.material.map = createLabelTexture(card, labelLayout.narrow)
            }
        })

        this.narrow = labelLayout.narrow
        this.root.position.y = this.scrollOffset()
    }

    scrollOffset()
    {
        const progress = this.scroll / scrollStep
        const index = Math.min(Math.floor(progress), this.cards.length - 1)
        const next = Math.min(index + 1, this.cards.length - 1)
        return THREE.MathUtils.lerp(this.cards[index].offset, this.cards[next].offset, progress - index)
    }

    // Prepare the portfolio objects and fly to them. State.js handles input and the button.
    enter(complete)
    {
        this.targetScroll = this.scroll = 0
        this.root.position.y = 0
        this.section = -1
        this.cards.forEach(({ model }) =>
        {
            gsap.killTweensOf(model.rotation)
            model.rotation.set(0, 0, 0)
        })

        const targetPosition = new THREE.Vector3(0, 0, VIEW.cameraZ)
        const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
            new THREE.Matrix4().lookAt(targetPosition, new THREE.Vector3(0, 0, -1), this.camera.up)
        )
        flyTo(this.camera, targetPosition, targetQuaternion, () =>
        {
            this.updateSection()
            complete()
        })
    }

    // Leave Works and fly to the avenue view where the intro finishes, wherever we entered from.
    exit(complete)
    {
        if(this.drag && this.canvas.hasPointerCapture(this.drag.id))
        {
            this.canvas.releasePointerCapture(this.drag.id)
        }
        this.drag = null
        this.cards.forEach(({ model }) => gsap.killTweensOf(model.rotation))

        // State.js keeps Works visible during the return and hides it when this animation reports arrival.
        flyToAvenue(this.camera, this.controls, this.experience.world.spaceStation.parameters, complete)
    }

    // Category navigation
    move(amount)
    {
        this.targetScroll = THREE.MathUtils.clamp(this.targetScroll + amount, 0, scrollStep * (this.cards.length - 1))
    }

    updateSection()
    {
        const index = THREE.MathUtils.clamp(Math.round(this.scroll / scrollStep), 0, this.cards.length - 1)
        if(this.section === index)
        {
            return
        }

        this.section = index
        const rotation = this.cards[index].model.rotation
        gsap.to(rotation,
        {
            duration: 1.5,
            ease: 'power2.inOut',
            x: '+=6.28',
            y: '+=6',
            overwrite: true
        })
    }

    // Label picking
    labelAt(x, y)
    {
        // Use the same position check as Billboards, for both the hand cursor and label clicks.
        // Only labels can be picked here; Works still decides which link a label opens.
        return pickObject({
            x,
            y,
            canvas: this.canvas,
            camera: this.camera,
            root: this.root,
            objects: this.labels,
            recursive: false
        })?.object
    }

    updateHover()
    {
        const hit = this.canInteract && this.pointerClient && !this.drag &&
            this.labelAt(this.pointerClient.x, this.pointerClient.y)
        this.canvas.style.cursor = hit ? 'pointer' : ''
    }

    openLabel(event)
    {
        const label = this.labelAt(event.clientX, event.clientY)
        if(label)
        {
            window.open(this.cards[label.userData.index].url, '_blank', 'noopener,noreferrer')
        }
    }

    // Animation
    update()
    {
        if(!this.canScroll && !this.canInteract)
        {
            return
        }

        const dt = Math.min(this.experience.time.delta / 1000, 0.05)
        this.scroll = THREE.MathUtils.damp(this.scroll, this.targetScroll, 8, dt)
        this.root.position.y = this.scrollOffset()
        this.models.update(this.experience.time.elapsed / 1000)

        // Works owns the common rotation for every category, including the mascot.
        this.cards.forEach(({ model }) =>
        {
            model.rotation.x += dt * 0.03
            model.rotation.y += dt * 0.05
        })

        this.updateSection()
        this.updateHover()
    }
}
