export const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
	gl_Position = vec4(a_position, 0.0, 1.0);
	v_texCoord = a_texCoord;
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform sampler2D u_curvesLut;

// Adjustments
uniform float u_brightness;
uniform float u_contrast;
uniform float u_exposure;
uniform float u_saturation;
uniform float u_vibrance;
uniform float u_temperature;
uniform float u_tint;
uniform float u_highlights;
uniform float u_shadows;
uniform float u_vignette;
uniform float u_grain;

// sRGB linearize / delinearize
vec3 srgbToLinear(vec3 c) {
	return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 linearToSrgb(vec3 c) {
	return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

// Luminance (Rec. 709)
float luminance(vec3 c) {
	return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

// Simple pseudo-random noise
float rand(vec2 co) {
	return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
	vec4 texel = texture(u_image, v_texCoord);
	vec3 color = texel.rgb;

	// Apply curves LUT (stored as 256x1 RGBA texture)
	color.r = texture(u_curvesLut, vec2(color.r, 0.125)).r; // row 0: RGB
	color.g = texture(u_curvesLut, vec2(color.g, 0.125)).g;
	color.b = texture(u_curvesLut, vec2(color.b, 0.125)).b;
	// Per-channel curves
	color.r = texture(u_curvesLut, vec2(color.r, 0.375)).r; // row 1: Red
	color.g = texture(u_curvesLut, vec2(color.g, 0.625)).g; // row 2: Green
	color.b = texture(u_curvesLut, vec2(color.b, 0.875)).b; // row 3: Blue

	// Work in linear space for physically-correct adjustments
	vec3 linear = srgbToLinear(color);

	// Exposure (EV stops)
	linear *= pow(2.0, u_exposure);

	// Back to sRGB for perceptual adjustments
	color = linearToSrgb(clamp(linear, 0.0, 1.0));

	// Brightness (simple offset)
	color += u_brightness;

	// Contrast (pivot around mid-gray)
	float contrastFactor = 1.0 + u_contrast;
	color = (color - 0.5) * contrastFactor + 0.5;

	// Temperature (warm/cool shift)
	color.r += u_temperature * 0.1;
	color.b -= u_temperature * 0.1;

	// Tint (green/magenta shift)
	color.g += u_tint * 0.1;

	// Highlights / Shadows
	float lum = luminance(color);
	float highlightMask = smoothstep(0.5, 1.0, lum);
	float shadowMask = 1.0 - smoothstep(0.0, 0.5, lum);
	color += u_highlights * highlightMask * 0.3;
	color += u_shadows * shadowMask * 0.3;

	// Saturation
	float gray = luminance(color);
	color = mix(vec3(gray), color, 1.0 + u_saturation);

	// Vibrance (saturates less-saturated colors more)
	float maxC = max(color.r, max(color.g, color.b));
	float minC = min(color.r, min(color.g, color.b));
	float sat = (maxC - minC) / (maxC + 0.001);
	float vibranceAmount = u_vibrance * (1.0 - sat) * 0.5;
	color = mix(vec3(gray), color, 1.0 + vibranceAmount);

	// Vignette
	vec2 center = v_texCoord - 0.5;
	float dist = length(center) * 1.414;
	float vig = 1.0 - u_vignette * dist * dist;
	color *= vig;

	// Grain
	if (u_grain > 0.0) {
		float noise = rand(v_texCoord * 1000.0) - 0.5;
		color += noise * u_grain * 0.15;
	}

	fragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
}
`;
