uniform float uTime;

varying float vTime;
varying vec3 vPosition;
varying float vAngle;
varying vec4 vColor;
varying vec2 vUv;

void main() {
	vPosition = position;

	vec4 mvPosition = modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);
	float ps = 1. - distance(vPosition, vec3(0.));

	gl_PointSize = 10. * ps;
	gl_Position = projectionMatrix * mvPosition;

	vTime = uTime;

	vPosition = vec3(mvPosition.x, mvPosition.y, mvPosition.z);

	vColor = vec4(0.5, 0.2, 0.1, 1.);
	vUv = uv;

	// vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // vec4 viewPosition = viewMatrix * modelPosition;
    // vec4 projectedPosition = projectionMatrix * viewPosition;

	// gl_Position = projectedPosition;

}