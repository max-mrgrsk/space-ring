uniform sampler2D tDiffuse; // import previous image from renderTarget
uniform vec3 uTint;

varying vec2 vUv;

void main()
{
    vec4 color = texture2D(tDiffuse, vUv);
    color.rgb += uTint;
    gl_FragColor = vec4(color);
}