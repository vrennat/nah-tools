import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders';
import type { AdjustmentParams, CurvesParams, CurvePoint } from './types';
import { DEFAULT_CURVES } from './types';

export class FilterRenderer {
	private gl: WebGL2RenderingContext;
	private program: WebGLProgram;
	private imageTexture: WebGLTexture;
	private curvesTexture: WebGLTexture;
	private vao: WebGLVertexArrayObject;
	private uniforms: Map<string, WebGLUniformLocation> = new Map();

	constructor(canvas: HTMLCanvasElement, image: HTMLImageElement | ImageBitmap) {
		const gl = canvas.getContext('webgl2', {
			alpha: true,
			premultipliedAlpha: false,
			preserveDrawingBuffer: true
		});
		if (!gl) throw new Error('WebGL2 not supported');
		this.gl = gl;

		// Set canvas size to match image
		canvas.width = image.width;
		canvas.height = image.height;
		gl.viewport(0, 0, image.width, image.height);

		// Compile shaders and link program
		this.program = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
		gl.useProgram(this.program);

		// Cache uniform locations
		const uniformNames = [
			'u_image', 'u_curvesLut',
			'u_brightness', 'u_contrast', 'u_exposure',
			'u_saturation', 'u_vibrance',
			'u_temperature', 'u_tint',
			'u_highlights', 'u_shadows',
			'u_vignette', 'u_grain'
		];
		for (const name of uniformNames) {
			const loc = gl.getUniformLocation(this.program, name);
			if (loc) this.uniforms.set(name, loc);
		}

		// Set up fullscreen quad
		this.vao = this.createQuad();

		// Upload image texture
		this.imageTexture = this.createImageTexture(image);

		// Create curves LUT texture (4 rows x 256 cols)
		this.curvesTexture = this.createCurvesTexture();

		// Bind texture units
		gl.uniform1i(this.uniforms.get('u_image')!, 0);
		gl.uniform1i(this.uniforms.get('u_curvesLut')!, 1);
	}

	render(params: AdjustmentParams, curves?: CurvesParams) {
		const gl = this.gl;
		gl.useProgram(this.program);

		// Set uniforms
		this.setUniform('u_brightness', params.brightness ?? 0);
		this.setUniform('u_contrast', params.contrast ?? 0);
		this.setUniform('u_exposure', params.exposure ?? 0);
		this.setUniform('u_saturation', params.saturation ?? 0);
		this.setUniform('u_vibrance', params.vibrance ?? 0);
		this.setUniform('u_temperature', params.temperature ?? 0);
		this.setUniform('u_tint', params.tint ?? 0);
		this.setUniform('u_highlights', params.highlights ?? 0);
		this.setUniform('u_shadows', params.shadows ?? 0);
		this.setUniform('u_vignette', params.vignette ?? 0);
		this.setUniform('u_grain', params.grain ?? 0);

		// Update curves LUT if provided
		if (curves) {
			this.updateCurvesTexture(curves);
		}

		// Bind textures
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.curvesTexture);

		// Draw
		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	toBlob(type = 'image/png', quality = 0.92): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const canvas = this.gl.canvas as HTMLCanvasElement;
			canvas.toBlob(
				(blob) => {
					if (blob) resolve(blob);
					else reject(new Error('Failed to create blob'));
				},
				type,
				quality
			);
		});
	}

	getImageData(): ImageData {
		const gl = this.gl;
		const w = gl.canvas.width;
		const h = gl.canvas.height;
		const pixels = new Uint8Array(w * h * 4);
		gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

		// WebGL reads bottom-to-top, flip vertically
		const flipped = new Uint8ClampedArray(w * h * 4);
		for (let y = 0; y < h; y++) {
			const srcRow = (h - 1 - y) * w * 4;
			const dstRow = y * w * 4;
			flipped.set(pixels.subarray(srcRow, srcRow + w * 4), dstRow);
		}

		return new ImageData(flipped, w, h);
	}

	destroy() {
		const gl = this.gl;
		gl.deleteTexture(this.imageTexture);
		gl.deleteTexture(this.curvesTexture);
		gl.deleteProgram(this.program);
		gl.deleteVertexArray(this.vao);
	}

	// --- Private helpers ---

	private setUniform(name: string, value: number) {
		const loc = this.uniforms.get(name);
		if (loc) this.gl.uniform1f(loc, value);
	}

	private createProgram(vsSrc: string, fsSrc: string): WebGLProgram {
		const gl = this.gl;
		const vs = this.compileShader(gl.VERTEX_SHADER, vsSrc);
		const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSrc);

		const program = gl.createProgram()!;
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const log = gl.getProgramInfoLog(program);
			gl.deleteProgram(program);
			throw new Error(`Shader link error: ${log}`);
		}

		gl.deleteShader(vs);
		gl.deleteShader(fs);
		return program;
	}

	private compileShader(type: number, source: string): WebGLShader {
		const gl = this.gl;
		const shader = gl.createShader(type)!;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const log = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			throw new Error(`Shader compile error: ${log}`);
		}

		return shader;
	}

	private createQuad(): WebGLVertexArrayObject {
		const gl = this.gl;
		const vao = gl.createVertexArray()!;
		gl.bindVertexArray(vao);

		// Position (clip space) + texCoord
		const data = new Float32Array([
			// x, y, u, v
			-1, -1, 0, 0,
			 1, -1, 1, 0,
			-1,  1, 0, 1,
			 1,  1, 1, 1
		]);

		const buffer = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

		const posLoc = gl.getAttribLocation(this.program, 'a_position');
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

		const texLoc = gl.getAttribLocation(this.program, 'a_texCoord');
		gl.enableVertexAttribArray(texLoc);
		gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);

		return vao;
	}

	private createImageTexture(image: HTMLImageElement | ImageBitmap): WebGLTexture {
		const gl = this.gl;
		const tex = gl.createTexture()!;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, tex);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		return tex;
	}

	private createCurvesTexture(): WebGLTexture {
		const gl = this.gl;
		const tex = gl.createTexture()!;
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, tex);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		// Initialize with identity LUT (4 rows x 256 cols)
		const data = new Uint8Array(256 * 4 * 4); // 256 pixels wide, 4 rows, RGBA
		for (let row = 0; row < 4; row++) {
			for (let i = 0; i < 256; i++) {
				const idx = (row * 256 + i) * 4;
				data[idx] = i;     // R
				data[idx + 1] = i; // G
				data[idx + 2] = i; // B
				data[idx + 3] = 255;
			}
		}

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

		return tex;
	}

	private updateCurvesTexture(curves: CurvesParams) {
		const gl = this.gl;
		const data = new Uint8Array(256 * 4 * 4);

		const channels: (keyof CurvesParams)[] = ['rgb', 'red', 'green', 'blue'];

		for (let row = 0; row < 4; row++) {
			const points = curves[channels[row]] ?? DEFAULT_CURVES[channels[row]];
			const lut = this.evaluateCurve(points);

			for (let i = 0; i < 256; i++) {
				const idx = (row * 256 + i) * 4;
				const val = lut[i];
				data[idx] = val;
				data[idx + 1] = val;
				data[idx + 2] = val;
				data[idx + 3] = 255;
			}
		}

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.curvesTexture);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 4, gl.RGBA, gl.UNSIGNED_BYTE, data);
	}

	private evaluateCurve(points: CurvePoint[]): Uint8Array {
		const lut = new Uint8Array(256);

		if (points.length < 2) {
			for (let i = 0; i < 256; i++) lut[i] = i;
			return lut;
		}

		// Sort by x
		const sorted = [...points].sort((a, b) => a.x - b.x);

		for (let i = 0; i < 256; i++) {
			const t = i / 255;
			let val: number;

			if (t <= sorted[0].x) {
				val = sorted[0].y;
			} else if (t >= sorted[sorted.length - 1].x) {
				val = sorted[sorted.length - 1].y;
			} else {
				// Find surrounding points and linearly interpolate
				let lo = 0;
				for (let j = 1; j < sorted.length; j++) {
					if (sorted[j].x >= t) {
						lo = j - 1;
						break;
					}
				}
				const hi = lo + 1;
				const range = sorted[hi].x - sorted[lo].x;
				const frac = range > 0 ? (t - sorted[lo].x) / range : 0;
				val = sorted[lo].y + frac * (sorted[hi].y - sorted[lo].y);
			}

			lut[i] = Math.round(Math.max(0, Math.min(1, val)) * 255);
		}

		return lut;
	}
}
