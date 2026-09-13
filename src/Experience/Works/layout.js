import * as THREE from 'three'

// Camera and scroll
export const VIEW = { cameraZ: 0.03, presentationZ: -0.45, scrollStep: 5.5 }

// Label appearance
export const LABELS = {
    referenceScale: 0.18,
    referenceAspect: 0.75,
    depthOffset: 0.1,
    marginPixels: 20,
    canvasWidth: 1536,
    color: '#ffeded',
    wide:
    {
        width: 3.1,
        canvasHeight: 520,
        titleSize: 160,
        titleY: 190,
        bodySize: 84,
        bodyY: 330,
        lineHeight: 90
    },
    narrow:
    {
        width: 2.3,
        canvasHeight: 800,
        titleSize: 210,
        titleY: 220,
        bodySize: 130,
        bodyY: 410,
        lineHeight: 135
    }
}

function getViewHeight(fov, depth = VIEW.cameraZ - VIEW.presentationZ)
{
    return 2 * depth * Math.tan(THREE.MathUtils.degToRad(fov / 2))
}

export function getLabelLayout(aspect, fov, viewportHeight)
{
    const narrow = aspect < 1
    const format = LABELS[narrow ? 'narrow' : 'wide']

    // Preserve the original text projection independently of all model sizing.
    const referenceScale = LABELS.referenceScale * Math.min(1, aspect / LABELS.referenceAspect)
    const z = LABELS.depthOffset * referenceScale
    const viewHeight = getViewHeight(fov, VIEW.cameraZ - (VIEW.presentationZ + z))

    // Viewport fitting
    const margin = viewHeight * LABELS.marginPixels / viewportHeight
    const ratio = format.canvasHeight / LABELS.canvasWidth
    const availableWidth = Math.max(0.01, viewHeight * aspect - margin * 2)
    const availableHeight = Math.max(0.01, viewHeight - margin * 2)
    const width = Math.min(format.width, availableWidth / referenceScale, availableHeight / referenceScale / ratio) * referenceScale

    return { narrow, z, width, height: width * ratio }
}

// Model sizing, horizontal placement and vertical spacing have independent controls.
const MODELS = {
    referenceScale: 0.18,
    narrowExponent: 0.8,
    wideAspect: 1.6,
    squareOffset: 0.054,
    wideOffset: 0.162
}

// Category spacing
const CARD_SPACING = { squareGap: 0.038, wideGap: 0.031, nextPeek: 0.035 }

export function getModelLayout(aspect, fov, categories)
{
    const compactAspect = Math.min(aspect, 1)

    // Gentle narrowing with a flat tangent at square; no preset switch at 1 or .75.
    const sizeFactor = Math.pow(compactAspect * (2 - compactAspect), MODELS.narrowExponent)
    const wideBlend = THREE.MathUtils.smoothstep(aspect, 1, MODELS.wideAspect)

    // Horizontal placement
    const offset = MODELS.squareOffset * THREE.MathUtils.smoothstep(aspect, 0, 1) +
        (MODELS.wideOffset - MODELS.squareOffset) * wideBlend

    // Vertical spacing
    const gap = THREE.MathUtils.lerp(CARD_SPACING.squareGap, CARD_SPACING.wideGap, wideBlend) * sizeFactor
    const viewHeight = getViewHeight(fov)
    const layout = []

    for(const category of categories)
    {
        const scale = MODELS.referenceScale * THREE.MathUtils.lerp(category.modelSize.square, category.modelSize.wide, wideBlend) * sizeFactor

        // Fixed composition envelopes keep spacing stable throughout the animations.
        const height = category.envelope * scale
        const previous = layout[layout.length - 1]
        const separation = previous ? (previous.height + height) / 2 + gap : 0
        const peekLimit = viewHeight / 2 + height / 2 - viewHeight * CARD_SPACING.nextPeek

        layout.push(
        {
            scale,
            height,
            x: category.side * offset,
            offset: previous ? previous.offset + Math.min(separation, peekLimit) : 0
        })
    }

    return layout
}
