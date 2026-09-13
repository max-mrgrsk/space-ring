import * as THREE from 'three'

// Adapted from the existing scroll-based Works project; keep its procedural models.
export default function createModels()
{
    // Shared materials
    const material = new THREE.MeshNormalMaterial()
    const wireframeMaterial = new THREE.MeshNormalMaterial({ wireframe: true })

    // Architecture
    const mesh2 = new THREE.Group()

    // Floors
    const architectureAmountOfFloors = 20
    const architectureHeightOfBuilding = 3
    const architectureWidthOfBuilding = architectureHeightOfBuilding / 3
    const architectureHeightOfFloors = architectureHeightOfBuilding / architectureAmountOfFloors
    const architectureHeightOfSlabs = architectureHeightOfFloors * 0.3
    const architectureSlabGeometry = new THREE.BoxGeometry(
        architectureWidthOfBuilding,
        architectureHeightOfSlabs,
        architectureWidthOfBuilding
    )

    for(let i = 0; i < architectureAmountOfFloors + 1; i++)
    {
        const architectureSlabs = new THREE.Mesh(architectureSlabGeometry, material)
        architectureSlabs.position.y = i * architectureHeightOfFloors - architectureHeightOfBuilding / 2
        architectureSlabs.position.x = (Math.random() - 0.5) * 0.2
        architectureSlabs.position.z = (Math.random() - 0.5) * 0.2
        mesh2.add(architectureSlabs)
    }

    // Columns
    const architectureAmountOfColumns = 5
    const architectureRadiusOfColumns = architectureWidthOfBuilding * 0.02
    const architectureColumnGeometry = new THREE.CylinderGeometry(
        architectureRadiusOfColumns,
        architectureRadiusOfColumns,
        architectureHeightOfBuilding
    )

    for(let i = 0; i < architectureAmountOfColumns; i++)
    {
        const architectureColumns = new THREE.Mesh(architectureColumnGeometry, material)
        architectureColumns.position.x = (Math.random() - 0.5) * (architectureWidthOfBuilding * 0.6)
        architectureColumns.position.z = (Math.random() - 0.5) * (architectureWidthOfBuilding * 0.6)
        mesh2.add(architectureColumns)
    }

    // Facades
    const architectureFacadeWindows = architectureWidthOfBuilding * 10
    const architectureFacadeWidth = architectureWidthOfBuilding * 0.63
    const architectureFacadeGeometry = new THREE.BoxGeometry(
        architectureFacadeWidth,
        architectureHeightOfFloors,
        architectureFacadeWidth,
        architectureFacadeWindows,
        1,
        architectureFacadeWindows
    )

    for(let i = 0; i < architectureAmountOfFloors; i++)
    {
        const architectureFacades = new THREE.Mesh(architectureFacadeGeometry, wireframeMaterial)
        architectureFacades.position.y = i * architectureHeightOfFloors - architectureHeightOfBuilding / 2 + architectureHeightOfFloors / 2
        architectureFacades.position.x = (Math.random() - 0.5) * (architectureWidthOfBuilding * 0.2)
        architectureFacades.position.z = (Math.random() - 0.5) * (architectureWidthOfBuilding * 0.2)
        mesh2.add(architectureFacades)
    }

    // Design
    const mesh3 = new THREE.Group()
    const casePlasticWidth = 0.1
    const casePlasticDepth = 0.2
    const caseMainWidth = 1
    const caseMainHeight = 2

    // Frame geometry
    const caseSideGeometry = new THREE.BoxGeometry(casePlasticWidth, caseMainHeight, casePlasticDepth)

    // Left side
    const caseSideLeft = new THREE.Mesh(caseSideGeometry, material)
    caseSideLeft.position.x = -caseMainWidth / 2

    // Left metal edge
    const caseSideLeftMetall = new THREE.Mesh(
        new THREE.CapsuleGeometry(casePlasticWidth * 0.5, caseMainHeight * 0.4, 4, 8),
        material
    )
    caseSideLeftMetall.position.x = -caseMainWidth * 0.5 - casePlasticWidth * 0.6

    // Right side
    const caseSideRight = new THREE.Mesh(caseSideGeometry, material)
    caseSideRight.position.x = caseMainWidth / 2

    // Right metal edge
    const caseSideRightMetall = new THREE.Mesh(
        new THREE.CapsuleGeometry(casePlasticWidth * 0.5, caseMainHeight * 0.4, 4, 8),
        material
    )
    caseSideRightMetall.position.x = caseMainWidth / 2 + casePlasticWidth * 0.6

    // Top side
    const caseSideUp = new THREE.Mesh(
        new THREE.BoxGeometry(caseMainWidth + casePlasticWidth, casePlasticWidth, casePlasticDepth),
        material
    )
    caseSideUp.position.y = caseMainHeight / 2 + casePlasticWidth / 2

    // Top glass
    const caseGlassUp = new THREE.Mesh(
        new THREE.CapsuleGeometry(casePlasticWidth * 0.5, caseMainHeight * 0.2, 4, 8),
        material
    )
    caseGlassUp.rotation.z = Math.PI / 2
    caseGlassUp.position.y = caseMainHeight / 2 + (casePlasticWidth)

    // Bottom side
    const caseSideBottom = new THREE.Mesh(
        new THREE.BoxGeometry(caseMainWidth + casePlasticWidth, casePlasticWidth, casePlasticDepth),
        material
    )
    caseSideBottom.position.y = -(caseMainHeight / 2 + casePlasticWidth / 2)

    // Connector
    const caseConnector = new THREE.Mesh(
        new THREE.BoxGeometry(caseMainWidth * 0.15, 0.12, casePlasticDepth * 0.2),
        material
    )
    caseConnector.position.y = -caseMainHeight / 2 + 0.06

    mesh3.add(caseSideLeft, caseSideLeftMetall, caseSideRight, caseSideRightMetall, caseSideUp, caseGlassUp, caseSideBottom, caseConnector)

    // Logo
    const caseLogoKnotWidth = caseMainWidth / 7
    const caseLogoKnot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(caseLogoKnotWidth, caseLogoKnotWidth / 2, 100, 16),
        material
    )
    mesh3.add(caseLogoKnot)

    // Floating knots
    const caseKnotWidth = caseLogoKnotWidth / 5
    const amountOfCaseKnots = 20
    const caseKnotsGeometry = new THREE.TorusKnotGeometry(caseKnotWidth, caseKnotWidth / 2, 100, 16)

    for(let i = 0; i < amountOfCaseKnots; i++)
    {
        const caseKnots = new THREE.Mesh(caseKnotsGeometry, material)
        caseKnots.position.x = (Math.random() - 0.5) * 2
        caseKnots.position.y = (Math.random() - 0.5) * 3
        caseKnots.position.z = (Math.random() - 0.5) * 2
        caseKnots.rotation.x = Math.random() * Math.PI
        caseKnots.rotation.y = Math.random() * Math.PI
        mesh3.add(caseKnots)
    }

    // Woodworking
    const mesh4 = new THREE.Group()
    const woodworkingTableWidth = 2
    const woodworkingTableHeight = 1.5
    const woodworkingTableDepth = 1
    const woodworkingTableTopThickness = woodworkingTableHeight / 5
    const woodworkingTableTopHeight = woodworkingTableHeight / 2 - woodworkingTableTopThickness / 2

    // Tabletop
    const woodworkingTableTop = new THREE.Mesh(
        new THREE.BoxGeometry(
            woodworkingTableWidth,
            woodworkingTableTopThickness,
            woodworkingTableDepth
        ),
        material
    )
    woodworkingTableTop.position.y = woodworkingTableTopHeight
    mesh4.add(woodworkingTableTop)

    // Leg geometry
    const woodworkingTableLegDisance = woodworkingTableWidth * 0.3
    const woodworkingTableLegGeomtry = new THREE.BoxGeometry(
        woodworkingTableTopThickness,
        woodworkingTableHeight - woodworkingTableTopThickness,
        woodworkingTableTopThickness
    )

    // Front legs
    for(let i = 0; i < 2; i++)
    {
        const woodworkingTableLeg = new THREE.Mesh(woodworkingTableLegGeomtry, material)
        woodworkingTableLeg.position.x = ((i - 0.5) / Math.abs(i - 0.5)) * woodworkingTableLegDisance
        woodworkingTableLeg.position.y = -woodworkingTableTopThickness / 2
        woodworkingTableLeg.position.z = woodworkingTableDepth / 2 - woodworkingTableTopThickness / 2
        mesh4.add(woodworkingTableLeg)
    }

    // Back legs
    for(let i = 0; i < 2; i++)
    {
        const woodworkingTableLeg = new THREE.Mesh(woodworkingTableLegGeomtry, material)
        woodworkingTableLeg.position.x = ((i - 0.5) / Math.abs(i - 0.5)) * woodworkingTableLegDisance
        woodworkingTableLeg.position.y = -woodworkingTableTopThickness / 2
        woodworkingTableLeg.position.z = -woodworkingTableDepth / 2 + woodworkingTableTopThickness / 2
        mesh4.add(woodworkingTableLeg)
    }

    // Short stretchers
    const woodworkingTableStretcherShortGeometry = new THREE.BoxGeometry(
        woodworkingTableTopThickness,
        woodworkingTableTopThickness,
        woodworkingTableDepth - 2 * woodworkingTableTopThickness
    )

    for(let i = 0; i < 2; i++)
    {
        const woodworkingTableStretcher = new THREE.Mesh(woodworkingTableStretcherShortGeometry, material)
        woodworkingTableStretcher.position.x = ((i - 0.5) / Math.abs(i - 0.5)) * woodworkingTableLegDisance
        woodworkingTableStretcher.position.y = -woodworkingTableHeight * 0.3
        mesh4.add(woodworkingTableStretcher)
    }

    // Long stretchers
    const woodworkingTableStretcherLongGeometry = new THREE.BoxGeometry(
        woodworkingTableLegDisance * 2 - woodworkingTableTopThickness,
        woodworkingTableTopThickness,
        woodworkingTableTopThickness
    )

    for(let i = 0; i < 2; i++)
    {
        const woodworkingTableStretcher = new THREE.Mesh(woodworkingTableStretcherLongGeometry, material)
        woodworkingTableStretcher.position.y = -woodworkingTableHeight * 0.3
        woodworkingTableStretcher.position.z = ((i - 0.5) / Math.abs(i - 0.5)) * (woodworkingTableDepth / 2 - woodworkingTableTopThickness / 2)
        mesh4.add(woodworkingTableStretcher)
    }

    // Vice
    const woodworkingViceGroup = new THREE.Group()
    woodworkingViceGroup.position.x = -woodworkingTableLegDisance
    mesh4.add(woodworkingViceGroup)

    // Wooden jaw
    const woodworkingViceWood = new THREE.Mesh(
        new THREE.BoxGeometry(
            woodworkingTableTopThickness,
            woodworkingTableHeight,
            woodworkingTableTopThickness / 2
        ),
        material
    )
    woodworkingViceGroup.add(woodworkingViceWood)

    // Vice axis group
    const woodworkingViceAxisGrop = new THREE.Group()
    woodworkingViceAxisGrop.position.y = 0.2
    woodworkingViceGroup.add(woodworkingViceAxisGrop)

    // Axis geometry
    const woodworkingViceAxisRadius = woodworkingTableTopThickness / 5
    const woodworkingViceAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(
            woodworkingViceAxisRadius,
            woodworkingViceAxisRadius,
            woodworkingTableDepth,
            6
        ),
        material
    )
    woodworkingViceAxis.position.z = -woodworkingTableDepth * 0.15
    woodworkingViceAxis.rotation.x = Math.PI / 2
    woodworkingViceAxisGrop.add(woodworkingViceAxis)

    // Axis head
    const woodworkingViceAxisHeadRadius = woodworkingViceAxisRadius * 2
    const woodworkingViceAxisHead = new THREE.Mesh(
        new THREE.CylinderGeometry(
            woodworkingViceAxisHeadRadius,
            woodworkingViceAxisHeadRadius,
            woodworkingTableTopThickness / 2,
            6
        ),
        material
    )
    woodworkingViceAxisHead.position.z = woodworkingTableDepth * 0.2
    woodworkingViceAxisHead.rotation.x = Math.PI / 2
    woodworkingViceAxisGrop.add(woodworkingViceAxisHead)

    // Handle
    const woodworkingViceHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(
            woodworkingViceAxisRadius,
            woodworkingViceAxisRadius,
            woodworkingTableDepth,
            6
        ),
        material
    )
    woodworkingViceHandle.position.z = woodworkingTableDepth * 0.2
    woodworkingViceAxisGrop.add(woodworkingViceHandle)

    // Wood scraps
    const amountOfWoodworkingTrash = 10
    const woodworkingTrashGeometry = new THREE.BoxGeometry(1, 1, 1)

    for(let i = 0; i < amountOfWoodworkingTrash; i++)
    {
        const woodworkingTrash = new THREE.Mesh(woodworkingTrashGeometry, material)
        woodworkingTrash.position.x = (Math.random() - 0.5) * 1.5
        woodworkingTrash.position.z = (Math.random() - 0.5) * 0.7
        woodworkingTrash.position.y = woodworkingTableHeight / 2
        woodworkingTrash.scale.x = Math.random() * 0.5
        woodworkingTrash.scale.y = Math.random() * 0.5
        woodworkingTrash.scale.z = Math.random() * 0.5
        mesh4.add(woodworkingTrash)
    }

    // Model references and animation
    return {
        material,
        architecture: mesh2,
        design: mesh3,
        woodworking: mesh4,
        update(elapsedTime)
        {
            caseGlassUp.position.x = Math.cos(elapsedTime) * 0.2
            caseSideLeftMetall.position.y = Math.cos(elapsedTime) * 0.4
            caseSideRightMetall.position.y = Math.sin(elapsedTime) * 0.3
            caseLogoKnot.rotation.z = Math.cos(elapsedTime) * 0.4

            woodworkingViceGroup.position.z = woodworkingTableDepth / 2 + 0.18 + Math.sin(elapsedTime * 2) * 0.1
            woodworkingViceAxisGrop.rotation.z = Math.sin(elapsedTime * 2) * 10
        }
    }
}
