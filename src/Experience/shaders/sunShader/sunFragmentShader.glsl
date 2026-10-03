uniform float uTime;
varying vec2 vUv;


void main()
{
    vec2 newUV = vUv;
    newUV = (vUv - 0.5) * 2.0; // move 0 to the cener and normalize

    // 1. Alpha Channel
    float alpha = length(newUV);
    alpha -= 0.5; // increase radius
    alpha = smoothstep(0.2, 0.5, alpha); // sharpen
    alpha = 1.0 - alpha; // invert

    // 3. Color
    float color = length(newUV);
    color = 1.0 - color;

    float r = 1.0;
    // float r = 0.9 + sin(uTime * 0.001) * 0.2;

    // 3.1 Tests
    // v1 ugly violet color inside
    // float g = 1.0;
    // float b = color;

    // v2 ugly yellow sun
    // float g = 0.0;
    // float b = color;

    // v3 crazy nice purple color
    // float g = color;
    // float b = 1.0;

    // v4 crazy nice yellow reallistic sun
    // float g = color;
    // float b = 0.0;

    // 3.2 final color for green and blue
    float g = color;

    float speed = 0.0005;
    speed = uTime * speed;
    float glowRhythm = cos(speed);
    glowRhythm = (1.0 + glowRhythm) / 2.0;
    float b = glowRhythm;

    gl_FragColor = vec4(r, g, b, alpha);
    #include <colorspace_fragment>
}
