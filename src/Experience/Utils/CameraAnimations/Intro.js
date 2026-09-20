import gsap from 'gsap' // animation. install command: npm install --save gsap@3.5.1
import Experience from '../../Experience'
import { avenue } from './namedViews.js'

export default class Intro
{
    // Prepare the intro using the named avenue view as its destination.
    constructor()
    {
        this.experience = new Experience
        this.camera = this.experience.camera.instance
        this.target = this.experience.camera.controls.target
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.avenueView = avenue(this.experience.world.spaceStation.parameters)
        this.setAnimation() 
    }
    // Fly into the avenue, moving both the camera and the point it looks at.
    setAnimation()
    {
        if(this.debug.active)
        {
            this.delay = 0
            this.duration = 0
        } else
        {
            this.delay = 3 //3
            this.duration = 8 // 16
        }

        gsap.to(
            this.camera.position,
            {
                duration: this.duration,
                delay: this.delay,
                x: this.avenueView.position.x,
                y: this.avenueView.position.y,
                z: this.avenueView.position.z
            })

        gsap.to(
            this.target,
            {
                duration: this.duration,
                delay: this.delay,
                x: this.avenueView.target.x,
                y: this.avenueView.target.y,
                z: this.avenueView.target.z,
            })
    }
}