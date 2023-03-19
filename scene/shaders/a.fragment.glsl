precision mediump float;

varying vec4 vColor;

uniform float _Hardness;

void main(void) {
    vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
    float l = length(uv);
    float a = smoothstep(1.0, _Hardness, l);
    a *= vColor.w;

    gl_FragColor = vec4(vColor.xyz * a, 1.0);
}
