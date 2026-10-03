import * as THREE from 'three'

export default class Mouse
{
    constructor(experience)
    {
        this.experience = experience
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