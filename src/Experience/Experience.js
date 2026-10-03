import * as THREE from 'three'

import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Mouse from './Utils/Mouse.js'
import Camera from './Camera.js'
import State from './State.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Works from './Works/Works.js'
import Resources from './Utils/Resources.js'
import sources from './sources.js'
import PostProcessing from './Utils/PostProcessing.js'

import Stats from 'stats.js'

let instance = null

export default class Experience
{
    constructor(canvas)
    {
        // Singleton
        if(instance)
        {
            return instance
        }
        instance = this
        
        // Global access
        window.experience = this

        // Options
        this.canvas = canvas

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.mouse = new Mouse()
        this.camera = new Camera(this)
        // One recipe controls flights, settled views, user input and the shared button.
        this.stateManager = new State(this)
        this.renderer = new Renderer()
        this.postProcessing = new PostProcessing()
        this.world = new World()
        this.stats = new Stats()

        // Stats panel
        if(this.debug.active)
        {
            this.stats.showPanel(0)
            document.body.appendChild(this.stats.dom)
        }

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        // Time tick event
        this.resources.on('ready', () =>
        {
            this.works = new Works(this)
            // Start only after both the world and Works exist, including when debug skips the intro duration.
            this.stateManager.startIntro()
            this.time.on('tick', () =>
            {
                this.update()
            })
        })
        
    }

    resize()
    {
        this.camera.resize()
        this.works?.resize()
        this.renderer.resize()
        this.postProcessing.resize()
    }

    update()
    {
        this.stats.begin()
        
        this.camera.update()
        this.world.update()
        this.works?.update()

        // Post Processing
        // pass postProcessing directly to the renderer
        // because it is initiated erlier then pP:
        this.renderer.update(this.postProcessing)
        // update PostProcessing for time in shaders
        this.postProcessing.update()

        this.stats.end()
    }
}
