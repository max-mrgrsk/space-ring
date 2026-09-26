import Intro from './Utils/CameraAnimations/Intro.js'

// THE DASHBOARD
// Each view says what is visible, what can be clicked, and where its button leads.
// Controls: enabled = rotate/pan/zoom; scroll = browse Works; disabled = no movement input.
// Flight overrides interaction only. Visibility during a trip is handled by applyVisibility() below.
const recipe = {
    flight: {
        controls: 'disabled',
        billboards: { clickable: false },
        works: { clickable: false },
        button: { visible: false }
    },
    station: {
        controls: 'enabled',
        billboards: { visible: true, clickable: true },
        works: { visible: false, clickable: false },
        button: { visible: true, label: '.works', destination: 'works' }
    },
    billboard: {
        controls: 'disabled',
        billboards: { visible: true, clickable: true },
        works: { visible: false, clickable: false },
        button: { visible: true, label: '<back', destination: 'station' }
    },
    works: {
        controls: 'scroll',
        billboards: { visible: true, clickable: false },
        works: { visible: true, clickable: true },
        button: { visible: true, label: '<back', destination: 'station' }
    }
}

export default class State
{
    // Lock input and hide the button while the scene loads. The intro will bring us to station.
    // This file alone changes experience.state and experience.view, and owns the shared button.
    constructor(experience)
    {
        this.experience = experience
        this.experience.state = 'flight'
        // No view has been reached yet. During later flights, view keeps the last place we arrived at.
        this.experience.view = null
        this.button = document.querySelector('#works-toggle')
        this.button.addEventListener('click', () => this.goTo(this.settings.button.destination))
        this.applyControls()
        this.applyButton()
    }

    // Read the rules for right now: the shared flight rules while travelling, or the view's own rules on arrival.
    // Scene files use these rules for clicks and scrolling, instead of deciding which view is active themselves.
    get settings()
    {
        return this.experience.state === 'flight' ? recipe.flight : recipe[this.experience.view]
    }

    // Start the opening journey after all objects exist. Show the station and keep Works hidden.
    // Input stays locked through the intro's initial delay and movement, until it reports arrival.
    startIntro()
    {
        this.applyVisibility('station')
        new Intro(() => this.settleAt('station'))
    }

    // Begin a trip: lock interaction, show the objects needed along the way, then start the animation.
    // Each view handles its own details, such as which billboard was selected and where to aim the camera.
    goTo(view)
    {
        if(this.experience.state === 'flight') return

        this.experience.state = 'flight'
        this.applyControls()
        this.applyButton()
        this.applyVisibility(view)
        const arrived = () => this.settleAt(view)
        const visits = {
            billboard: this.experience.world.billboards.cameraAnimation,
            works: this.experience.works
        }

        // Back asks the view we are leaving to fly to avenue. Other trips enter the requested view.
        const returningToStation = view === 'station'
        if(returningToStation)
        {
            visits[this.experience.view].exit(arrived)
        }
        else
        {
            visits[view].enter(arrived)
        }
    }

    // Record arrival, then apply the destination's controls, button and visibility settings.
    // Settled means ready for interaction; the ring and a followed billboard can keep moving.
    settleAt(view)
    {
        this.experience.view = view
        this.experience.state = 'settled'
        this.applyControls()
        this.applyButton()
        this.applyVisibility(view)
    }

    // Enable camera rotation, panning and zooming only in enabled mode.
    // In scroll mode, Works handles wheel and drag input itself; the camera stays fixed.
    // Clear the old hand cursor too, since the previous view's object may no longer be clickable.
    applyControls()
    {
        this.experience.camera.controls.enabled = this.settings.controls === 'enabled'
        this.experience.canvas.style.cursor = ''
    }

    // Show the current view's button and label, or hide it while flying.
    // Disable hidden buttons too, so keyboard activation cannot start another trip during a flight.
    applyButton()
    {
        const button = this.settings.button
        this.button.hidden = !button.visible
        this.button.disabled = !button.visible
        this.button.textContent = button.label || ''
    }

    // While flying, show objects needed by either the departure or destination view.
    // This makes Works appear before we fly towards it, and keeps it visible throughout the trip back.
    // Once settled, use only the destination's visibility settings, so Works disappears after reaching station.
    applyVisibility(destination)
    {
        const departure = recipe[this.experience.view] || recipe.station
        const arrival = recipe[destination]
        const isFlying = this.experience.state === 'flight'
        this.experience.world.billboards.group.visible = arrival.billboards.visible || (isFlying && departure.billboards.visible)
        this.experience.works.root.visible = arrival.works.visible || (isFlying && departure.works.visible)
    }
}
