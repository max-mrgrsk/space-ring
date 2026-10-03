export default class StationParameters
{
    constructor()
    {
        this.setParameters()
    }
    setParameters()
    {
        this.parameters = {}

        /**
         * Space Station
         */
        this.parameters.stationRadius = 3
        this.parameters.stationWidth = 1
        this.parameters.rotationSpeed = 0.0001

        this.parameters.amountOfHouses = 2000
        this.parameters.houseMaxHeight = 0.3
        this.parameters.houseWidth = 0.1

        this.parameters.amountOfFloors = 25
        this.parameters.floorHeight = 0.05

        /**
         * Space Cars
         */
        this.parameters.amountOfCars = 500
        this.parameters.flightHeight = 0.2
        this.parameters.rotationSpeed = 0.0001

        this.parameters.carScale = 0.005

        /**
         * Flight
         */
    }
}
