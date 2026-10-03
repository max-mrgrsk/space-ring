attribute float aSize;
attribute float aScale;
uniform float uTime;
uniform float uRotationSpeed;
uniform float uMinSize;
uniform float uMaxSize;
varying vec3 vColor;

void main()
{
    /**
     * Position
     */
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // position start
    float angle = atan(modelPosition.y, modelPosition.x);
    float distanceToCenter = length(modelPosition.yx);
    float shiftSize = aSize - 0.5;
    float angleOffset = shiftSize * uTime * uRotationSpeed;
    angle += angleOffset;
    modelPosition.y = sin(angle) * distanceToCenter;
    modelPosition.x = cos(angle) * distanceToCenter;


    // position end

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    /**
     * Size
     */
    gl_PointSize = mix(uMaxSize, uMinSize, aSize);
    gl_PointSize *= aScale; // add randomness

    // sizeAttenuation if needed:
    // gl_PointSize *= 15.0;
    // gl_PointSize *= ( 1.0 / - viewPosition.z);

    /**
     * Color
     */
    vColor = color;
}
