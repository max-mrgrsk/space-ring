uniform sampler2D tDiffuse; // import previous image from renderTarget
uniform sampler2D uNormalMap; // import texture

varying vec2 vUv;

void main()
{
    // set normal texture
    vec4 normalColor = texture2D(uNormalMap, vUv);

    // remap values from 0:1 to -1:1
    normalColor.rgb *= 2.0;
    normalColor.rgb -= 1.0;

    // set new uv
    vec2 shiftedUV = vUv;

    // set displacement
    shiftedUV.xy += normalColor.rg * 0.1;

    // add displacement to previous pass texture
    vec4 color = texture2D(tDiffuse, shiftedUV);

    // add shadows from normals
    // color.rgb += normalColor.ggg * 0.05; // affect color

    // add light glow
    vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
    float lightness = dot(normalColor.rgb, lightDirection);
    lightness = clamp(lightness, 0.0, 1.0);
    color.rgb += lightness * 0.2;

    gl_FragColor = vec4(color);
}