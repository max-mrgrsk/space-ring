import * as THREE from 'three'
import Experience from '../Experience'

export default class Mouse
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        
        this.instance = new THREE.Vector2()

        window.addEventListener
        (
            'mousemove', () =>
            {
                
                this.instance.x = event.clientX / this.sizes.width * 2 - 1
                this.instance.y = -(event.clientY / this.sizes.height * 2 - 1)
            }
        )
        
    }
}