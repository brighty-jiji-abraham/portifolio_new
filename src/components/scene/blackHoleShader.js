export const blackHoleShader = `
  uniform float time, cinematic, zoom, bank, inclination, aspect, exposure;
  uniform sampler2D sky;
  uniform mat3 cameraToSky;
  varying vec2 vUv;
  varying vec3 vViewPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 cell = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + 1.0), f.x), f.y);
  }
  vec3 diskLight(vec3 hit) {
    float radius = length(hit.xz);
    float angle = atan(hit.z, hit.x);
    float orbit = angle + time * 0.48 * pow(3.0 / radius, 1.5);
    // Stretched turbulence follows the gas instead of flickering randomly.
    vec2 flow = vec2(radius * 9.0 + sin(orbit) * 3.0 + time * 0.24, cos(orbit) * 10.0);
    float turbulence = noise(flow) * 0.55 + noise(flow * 2.0) * 0.3 + noise(flow * 4.0) * 0.15;
    float filaments = pow(0.5 + 0.5 * sin(radius * 54.0 + turbulence * 7.0 + sin(orbit * 5.0) - time * 0.9), 3.0);
    float hotArc = pow(0.5 + 0.5 * cos(orbit * 2.0 + radius * 0.55), 8.0)
      * exp(-pow((radius - 4.4) / 1.5, 2.0));
    float heat = pow(3.0 / radius, 0.75);
    vec3 color = mix(vec3(0.5, 0.035, 0.006), vec3(1.0, 0.34, 0.055), heat);
    color = mix(color, vec3(1.0, 0.66, 0.28), pow(heat, 5.0) * 0.8);
    float beaming = pow(1.0 / (1.0 + 0.34 * hit.x / radius), 3.0);
    float edge = smoothstep(3.0, 3.5, radius) * (1.0 - smoothstep(8.0, 11.0, radius));
    color = mix(color, vec3(1.0, 0.76, 0.38), hotArc * 0.5);
    return color * (0.35 + turbulence * 0.95 + filaments * 0.35 + hotArc * 0.9)
      * pow(3.0 / radius, 2.1) * beaming * edge * 2.4;
  }

  void main() {
    vec2 screen = (vUv - 0.5) * vec2(26.0, 26.0 / aspect) / zoom;
    screen = mat2(cos(bank), -sin(bank), sin(bank), cos(bank)) * screen;
    // A slightly inclined observer sees the thin disk almost edge-on.
    vec3 origin = vec3(0.0, inclination, 26.0);
    vec3 forward = normalize(-origin);
    vec3 up = normalize(cross(vec3(1.0, 0.0, 0.0), forward));
    vec3 velocity = normalize(forward * 26.0 + vec3(screen.x, 0.0, 0.0) + up * screen.y);
    vec3 initialVelocity = velocity;
    vec3 point = origin;
    vec3 angular = cross(point, velocity);
    float impact2 = dot(angular, angular);
    vec3 light = vec3(0.0);
    float alpha = 0.0;

    // Bounded, artistic Schwarzschild-style ray bending, shared by the sky
    // landmark and the cinematic view; not a scientific relativity solver.
    for (int i = 0; i < 88; i++) {
      float radius = length(point);
      if (radius < 1.0) { alpha = 1.0; break; }
      if (radius > 34.0) break;
      float stepSize = clamp(radius * 0.12, 0.075, 1.4);
      vec3 previous = point;
      vec3 acceleration = -1.5 * impact2 * point / pow(radius, 5.0);
      point += velocity * stepSize + acceleration * stepSize * stepSize * 0.5;
      vec3 nextAcceleration = -1.5 * impact2 * point / pow(length(point), 5.0);
      velocity += (acceleration + nextAcceleration) * stepSize * 0.5;

      if (previous.y * point.y < 0.0) {
        vec3 hit = mix(previous, point, previous.y / (previous.y - point.y));
        float diskRadius = length(hit.xz);
        if (diskRadius > 3.0 && diskRadius < 11.0) {
          light = diskLight(hit);
          alpha = 1.0 - smoothstep(8.5, 11.0, diskRadius);
          break;
        }
      }
    }

    // A soft halo keeps the hot gas luminous without a full-screen bloom pass.
    float distance = length(screen);
    float photon = exp(-abs(distance - 2.6) * 20.0) * 0.19;
    float halo = exp(-abs(distance - 2.8) * 1.7) * 0.055;
    float diskGlow = exp(-abs(screen.y + 0.2) * 2.4) * exp(-abs(screen.x) * 0.22) * 0.055;
    float glow = photon + (halo + diskGlow) * smoothstep(2.45, 2.9, distance)
      * (0.94 + 0.06 * sin(time * 0.65));
    vec3 glowColor = vec3(1.0, 0.28, 0.045) * glow;
    float glowAlpha = clamp(glow * 2.0, 0.0, 0.5);
    float combinedAlpha = alpha + glowAlpha * (1.0 - alpha);
    vec3 premultiplied = light * alpha + glowColor;
    if (cinematic > 0.001) {
      // Bend rays from the live universe camera into the same rotated star map.
      // Lensing arrives gradually; the sky never switches to a different view.
      vec3 bend = normalize(velocity) - initialVelocity;
      vec3 viewBend = vec3(bend.x, dot(bend, up), -dot(bend, forward));
      vec3 direction = normalize(cameraToSky * normalize(normalize(vViewPosition) + viewBend * 0.65));
      vec2 skyUv = vec2(fract(atan(direction.z, -direction.x) / 6.2831853),
        asin(clamp(direction.y, -1.0, 1.0)) / 3.14159265 + 0.5);
      vec3 stars = texture2D(sky, skyUv).rgb;
      float dust = dot(stars, vec3(0.2126, 0.7152, 0.0722));
      vec3 tint = mix(vec3(0.62, 0.76, 1.0), vec3(1.0, 0.79, 0.62), smoothstep(0.2, 0.7, skyUv.x));
      vec3 background = stars * mix(tint, vec3(1.0), smoothstep(0.04, 0.3, dust)) * 0.38;
      background += vec3(0.0007, 0.0011, 0.0022);
      // Feather the plane edges so the star field remains continuous around it.
      float edge = smoothstep(0.0, 0.12, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
      float lensing = cinematic * edge;
      premultiplied += background * (1.0 - combinedAlpha) * lensing;
      combinedAlpha = mix(combinedAlpha, 1.0, lensing);
    }
    if (combinedAlpha < 0.003) discard;
    gl_FragColor = vec4(premultiplied / max(combinedAlpha, 0.001) * exposure, combinedAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
