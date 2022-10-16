uniform float uTime;
uniform vec2 uResolution;

varying float vTime;
varying vec3 vPosition;
varying float vAngle;
varying vec4 vColor;
varying vec2 vUv;
varying vec2 vResolution;

varying vec4 vCoords;

vec3 getOffset(float ratio, float threshold) {
	return vec3(cos((ratio * 80.0 + 10.0) * threshold) * 20.0 * threshold, (sin((ratio * 90.0 + 30.0) * threshold) + 1.0) * 5.0 * threshold + mix(vResolution.y, -vResolution.y, ratio / threshold), sin((ratio * 70.0 + 20.0) * threshold) * 20.0 * threshold);
}

void main() {

	vUv = uv;
	vResolution = uResolution;
	vPosition = position;
	vTime = uTime;

	float indexRatio = (position.y * 1.2);
	float threshold = 0.7 + indexRatio * 0.75;
	float ratio = mod((uTime * 0.1) - indexRatio * 2.5, threshold);
	vec3 offset = getOffset(ratio, threshold);

	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

	float ps = 1. - distance(vPosition, vec3(0.1));

	gl_PointSize = 30. * ps;
	vec4 coords = projectionMatrix * mvPosition;

	coords.y += (offset.y * 0.01) * -0.75 - (ps * 8.);
	coords.x += (offset.x * 0.033) * -0.75;

	gl_Position = coords;
	vCoords = coords;

	vPosition = vec3(mvPosition.x, mvPosition.y, mvPosition.z);
}