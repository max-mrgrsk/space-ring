uniform sampler2D tDiffuse; // import previous image from renderTarget
uniform float uTime;

float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

varying vec2 vUv;

void main()
{
    

    // v01 from the lesson ---------------------------------------------------
    // vec2 shiftedUV = vUv;
    // shiftedUV.y += sin(shiftedUV.x * 10.0 + uTime * 0.001) * 0.2 ;

    // v2 waves --------------------------------------------------------------
    float originalValue = uTime; // Your original value in the range [0, 3000]
    float remappedValue = remap(originalValue, 0.0, 2000.0, 1.3, 0.0);
    remappedValue = max(remappedValue, 0.0);
    vec2 shiftedUV = vUv;
    shiftedUV.y += sin(shiftedUV.x * 20.0 + uTime * 0.001) * remappedValue ;

    // v3 TV -----------------------------------------------------------------
    // vec2 shiftedUV = vUv;
    // float firstPhase = 800.0;
    // float pause = firstPhase + 400.0;
    // float secondPhase = pause + firstPhase;

    // float remappedX = remap(uTime, 0.0, firstPhase, 50.0, 1.0); // remap first second to 50->1
    // remappedX = max(remappedX, 1.0); // limit to +1
    // float divisionX = remappedX;
    // float offsetX = (divisionX - 1.0) / 2.0;
    // shiftedUV.x *= divisionX;
    // shiftedUV.x -= offsetX;

    // float remappedY = remap(uTime, pause, secondPhase, 50.0, 1.0); // remap first second to 50->1
    // remappedY = min(remappedY, 50.0); // limit to 50
    // remappedY = max(remappedY, 1.0); // limit to 1
    // float divisionY = remappedY;
    // float offsetY = (divisionY - 1.0) / 2.0;
    // shiftedUV.y *= divisionY;
    // shiftedUV.y -= offsetY;

    // Final -----------------------------------------------------------------
    vec4 color = texture2D(tDiffuse, shiftedUV);
    gl_FragColor = vec4(color);
}