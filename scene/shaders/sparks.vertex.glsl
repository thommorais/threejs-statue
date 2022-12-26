      precision mediump float;

      attribute vec4 aPosition;
      attribute float aOpacity;
      attribute float aScale;
      attribute vec3 aRotation;
      attribute float aSize;
      attribute vec3 aSpeed;

      uniform float uTime;
      uniform float uSize;
      uniform float uGravity;
      uniform vec3 uSpeed;
      uniform vec3 uWorldSize;
      uniform mat4 uProjection;
      uniform float uWind;
  	  uniform vec2 uResolution;

      varying float vRotation;
      varying float vOpacity;
      varying vec4 vPosition;
      varying float vTime;


      void main() {

        vec4 modelPosition = modelMatrix * vec4(position, 1.5);

        vOpacity = aOpacity;

        vRotation = aRotation.x * aRotation.y / 60.2;

        modelPosition.x = mod(modelPosition.x + uTime + uWind * (aSpeed.x + uSpeed.x), uWorldSize.x * 2.0) - uWorldSize.x;
        modelPosition.y = mod(modelPosition.y + uTime * (aSpeed.y + uSpeed.y) * uGravity, uWorldSize.y * 2.0) - uWorldSize.y;

        modelPosition.x += (sin(uTime * aSpeed.z) * aRotation.z);
        modelPosition.z += cos(uTime * aSpeed.z) * aRotation.z;

        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;

        vPosition = modelPosition;
        vTime = uTime;

        gl_PointSize = uSize * aScale;
        gl_PointSize *= ( 1.0 / - viewPosition.z );
      }