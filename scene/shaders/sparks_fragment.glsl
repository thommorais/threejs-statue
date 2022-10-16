varying float vTime;
varying vec2 vUv;
varying vec3 vPosition;
varying vec2 vResolution;
varying vec4 vCoords;
// create fire sparks with a random position
void main() {
    vec2 pointCoord = gl_PointCoord;

    float alpha = 1. - smoothstep(-0.00, .55, length(pointCoord - vec2(.5, .5)));
    alpha *= .8;

    vec2 uv = vec2(pointCoord.x, 1. - pointCoord.y);
    vec2 cUv = 2.*uv - 1.;

    vec3 originalColor = vec3(10./255., 4./255., 1./255.);

    vec4 color = vec4(0.045/length(cUv));
    color.rgb = min(vec3(10.), color.rgb);

    color.rgb *= originalColor*120.;
    color.a = alpha;

    gl_FragColor = color;
}