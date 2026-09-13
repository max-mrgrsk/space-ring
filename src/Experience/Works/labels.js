import * as THREE from 'three'
import { LABELS } from './layout.js'

export default function createLabelTexture(category, narrow)
{
    // Canvas setup
    const format = LABELS[narrow ? 'narrow' : 'wide']
    const canvas = document.createElement('canvas')
    canvas.width = LABELS.canvasWidth
    canvas.height = format.canvasHeight

    const context = canvas.getContext('2d')
    context.fillStyle = LABELS.color
    context.textAlign = 'center'

    // Text
    context.font = `bold ${format.titleSize}px sans-serif`
    context.fillText(category.title, canvas.width / 2, format.titleY)

    context.font = `${format.bodySize}px sans-serif`
    category.lines[narrow ? 'narrow' : 'wide'].forEach((line, index) =>
    {
        context.fillText(line, canvas.width / 2, format.bodyY + index * format.lineHeight)
    })

    // Texture
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace

    return texture
}
