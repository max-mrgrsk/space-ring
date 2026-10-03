// import Space Station
import SpaceStation from './SpaceStation/SpaceStation.js'
import Billboards from './SpaceStation/Billboards.js'
import SpaceCars from './SpaceStation/SpaceCars.js'
import CanyonCars from './SpaceStation/CanyonCars.js'
import Player from './SpaceStation/Player.js'

// Import Deep Space
import Stars from './DeepSpace/Stars.js'
import Satellites from './DeepSpace/Satellites.js'
import Sun from './DeepSpace/Sun.js'


export default class World
{
    constructor(experience)
    {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        // Wait for resources
        this.resources.on('ready', () =>
        {
            // Setup
            this.spaceStation = new SpaceStation()
            this.spaceCars = new SpaceCars()
            this.canyonCars = new CanyonCars
            this.billboards = new Billboards()
            this.player = new Player()

            this.stars = new Stars()
            this.sun = new Sun()
            this.satellites = new Satellites()
        })
    }

    update()
    {
        this.spaceStation.update()
        this.billboards.update()
        this.spaceCars.update()
        this.canyonCars.update()
        this.player.update()
        
        this.stars.update()
        this.sun.update()
        this.satellites.update()
    }
}