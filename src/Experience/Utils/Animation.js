import gsap from 'gsap' // animation. install command: npm install --save gsap@3.5.1
import Experience from '../Experience'

export default class Animation
{
    constructor()
    {
        this.experience = new Experience
        this.camera = this.experience.camera.instance
        this.target = this.experience.camera.controls.target
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.setHeight()
        this.setAnimation() 
    }
    setHeight()
    {
        this.world = this.experience.world
        this.stationRadius = this.world.spaceStation.parameters.stationRadius
        this.houseMaxHeight = this.world.spaceStation.parameters.houseMaxHeight
        this.roofTopRadius = this.stationRadius - this.houseMaxHeight
        this.flightHeight = - 0.05
        this.cameraHeight = - this.roofTopRadius + this.flightHeight
    }
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
                x: 0, 
                y: this.cameraHeight,
                z: 0.03
            })

        gsap.to(
            this.target,
            {
                duration: this.duration,
                delay: this.delay,
                x: 0,
                y: this.cameraHeight,
                z: 0,
            })
    }
}