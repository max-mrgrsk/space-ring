// Keep each category's model, copy and link together. Text wrapping is intentional.
// Envelopes are fixed composition heights in model units, not per-frame bounds.
export default function createCategories({ engineering, architecture, design, woodworking })
{
    return [
        {
            title: 'engineering',
            model: engineering,
            side: 1,

            lines:
            {
                wide: ['Staff Creative Engineer at Zoo.dev', '2024–present'],
                narrow: ['Staff Creative', 'Engineer at Zoo.dev', '2024–present']
            },
            url: 'https://zoo.dev',

            modelSize: { square: 1.05, wide: 0.85 },
            envelope: 2.6
        },
        {
            title: 'architecture',
            model: architecture,
            side: -1,

            lines:
            {
                wide: ['13 years project architect', 'at J.MAYER.H'],
                narrow: ['13 years', 'project architect', 'at J.MAYER.H']
            },
            url: 'https://jmayerh.de/',

            modelSize: { square: 1.05, wide: 0.85 },
            envelope: 3.2
        },
        {
            title: 'design',
            model: design,
            side: 1,

            lines:
            {
                wide: ['5 years head of design', 'at moscase'],
                narrow: ['5 years', 'head of design', 'at moscase']
            },
            url: 'https://www.moscase.com/',

            modelSize: { square: 0.95, wide: 0.75 },
            envelope: 2.8
        },
        {
            title: 'woodworking',
            model: woodworking,
            side: -1,

            lines:
            {
                wide: ['making workbench', 'on youtube'],
                narrow: ['making workbench', 'on youtube']
            },
            url: 'https://youtu.be/hs4sur3MTwM?si=rcqBQnECJ8njElrM',

            modelSize: { square: 1.05, wide: 0.85 },
            envelope: 2.6
        }
    ]
}
