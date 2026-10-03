import GUI from 'lil-gui'

export default class Debug
{
    constructor()
    {
        this.active = window.location.hash === '#debug'

        if(this.active)
        {
            this.ui = new GUI({
                width: 300,
                title: 'Nice debug UI',
                closeFolders: false,
            })
            this.ui.close()
        }
    }
}
