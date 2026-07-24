/**
 * Minimal DOMMatrix polyfill for pdfjs-dist text extraction on serverless.
 * Only the subset used by pdfjs getTextContent() is implemented.
 */

type Init = number[] | Float32Array | Float64Array;

class DOMMatrixPoly {
  m11 = 1; m12 = 0; m13 = 0; m14 = 0;
  m21 = 0; m22 = 1; m23 = 0; m24 = 0;
  m31 = 0; m32 = 0; m33 = 1; m34 = 0;
  m41 = 0; m42 = 0; m43 = 0; m44 = 1;
  is2D = true;

  constructor(init?: string | Init) {
    if (!init) return;
    const v = typeof init === "string" ? init.split(/[\s,]+/).map(Number) : Array.from(init);
    if (v.length === 6) {
      this.m11 = v[0]; this.m12 = v[1];
      this.m21 = v[2]; this.m22 = v[3];
      this.m41 = v[4]; this.m42 = v[5];
      this.is2D = true;
    } else if (v.length === 16) {
      [
        this.m11, this.m12, this.m13, this.m14,
        this.m21, this.m22, this.m23, this.m24,
        this.m31, this.m32, this.m33, this.m34,
        this.m41, this.m42, this.m43, this.m44,
      ] = v;
      this.is2D = false;
    }
  }

  get a() { return this.m11; } set a(v) { this.m11 = v; }
  get b() { return this.m12; } set b(v) { this.m12 = v; }
  get c() { return this.m21; } set c(v) { this.m21 = v; }
  get d() { return this.m22; } set d(v) { this.m22 = v; }
  get e() { return this.m41; } set e(v) { this.m41 = v; }
  get f() { return this.m42; } set f(v) { this.m42 = v; }

  get isIdentity() {
    return (
      this.m11 === 1 && this.m12 === 0 && this.m13 === 0 && this.m14 === 0 &&
      this.m21 === 0 && this.m22 === 1 && this.m23 === 0 && this.m24 === 0 &&
      this.m31 === 0 && this.m32 === 0 && this.m33 === 1 && this.m34 === 0 &&
      this.m41 === 0 && this.m42 === 0 && this.m43 === 0 && this.m44 === 1
    );
  }

  multiply(other: DOMMatrixPoly) { return this._clone()._multiplySelf(other); }
  multiplySelf(other: DOMMatrixPoly) { return this._multiplySelf(other); }

  translate(tx = 0, ty = 0, tz = 0) { return this._clone()._translateSelf(tx, ty, tz); }
  translateSelf(tx = 0, ty = 0, tz = 0) { return this._translateSelf(tx, ty, tz); }

  scale(sx = 1, sy?: number, sz = 1, ox = 0, oy = 0, oz = 0) {
    return this._clone()._scaleSelf(sx, sy ?? sx, sz, ox, oy, oz);
  }
  scaleSelf(sx = 1, sy?: number, sz = 1, ox = 0, oy = 0, oz = 0) {
    return this._scaleSelf(sx, sy ?? sx, sz, ox, oy, oz);
  }
  scaleNonUniform(sx = 1, sy = 1) { return this.scale(sx, sy, 1, 0, 0, 0); }

  inverse() { return this._clone()._invertSelf(); }
  invertSelf() { return this._invertSelf(); }

  transformPoint(p: { x?: number; y?: number; z?: number; w?: number } = {}) {
    const { x = 0, y = 0, z = 0, w = 1 } = p;
    return {
      x: this.m11 * x + this.m21 * y + this.m31 * z + this.m41 * w,
      y: this.m12 * x + this.m22 * y + this.m32 * z + this.m42 * w,
      z: this.m13 * x + this.m23 * y + this.m33 * z + this.m43 * w,
      w: this.m14 * x + this.m24 * y + this.m34 * z + this.m44 * w,
    };
  }

  toFloat64Array() {
    return Float64Array.from([
      this.m11, this.m12, this.m13, this.m14,
      this.m21, this.m22, this.m23, this.m24,
      this.m31, this.m32, this.m33, this.m34,
      this.m41, this.m42, this.m43, this.m44,
    ]);
  }

  toString() {
    return this.is2D
      ? `matrix(${this.a},${this.b},${this.c},${this.d},${this.e},${this.f})`
      : `matrix3d(${this.toFloat64Array().join(",")})`;
  }

  static fromMatrix(other: DOMMatrixPoly) {
    const m = new DOMMatrixPoly();
    m.m11 = other.m11; m.m12 = other.m12; m.m13 = other.m13; m.m14 = other.m14;
    m.m21 = other.m21; m.m22 = other.m22; m.m23 = other.m23; m.m24 = other.m24;
    m.m31 = other.m31; m.m32 = other.m32; m.m33 = other.m33; m.m34 = other.m34;
    m.m41 = other.m41; m.m42 = other.m42; m.m43 = other.m43; m.m44 = other.m44;
    m.is2D = other.is2D;
    return m;
  }

  static fromFloat64Array(a: Float64Array) { return new DOMMatrixPoly(a); }
  static fromFloat32Array(a: Float32Array) { return new DOMMatrixPoly(a); }

  /* ---- internal helpers ---- */

  private _clone() { return DOMMatrixPoly.fromMatrix(this); }

  private _multiplySelf(o: DOMMatrixPoly) {
    const a11 = this.m11, a12 = this.m12, a13 = this.m13, a14 = this.m14;
    const a21 = this.m21, a22 = this.m22, a23 = this.m23, a24 = this.m24;
    const a31 = this.m31, a32 = this.m32, a33 = this.m33, a34 = this.m34;
    const a41 = this.m41, a42 = this.m42, a43 = this.m43, a44 = this.m44;

    this.m11 = a11*o.m11 + a12*o.m21 + a13*o.m31 + a14*o.m41;
    this.m12 = a11*o.m12 + a12*o.m22 + a13*o.m32 + a14*o.m42;
    this.m13 = a11*o.m13 + a12*o.m23 + a13*o.m33 + a14*o.m43;
    this.m14 = a11*o.m14 + a12*o.m24 + a13*o.m34 + a14*o.m44;
    this.m21 = a21*o.m11 + a22*o.m21 + a23*o.m31 + a24*o.m41;
    this.m22 = a21*o.m12 + a22*o.m22 + a23*o.m32 + a24*o.m42;
    this.m23 = a21*o.m13 + a22*o.m23 + a23*o.m33 + a24*o.m43;
    this.m24 = a21*o.m14 + a22*o.m24 + a23*o.m34 + a24*o.m44;
    this.m31 = a31*o.m11 + a32*o.m21 + a33*o.m31 + a34*o.m41;
    this.m32 = a31*o.m12 + a32*o.m22 + a33*o.m32 + a34*o.m42;
    this.m33 = a31*o.m13 + a32*o.m23 + a33*o.m33 + a34*o.m43;
    this.m34 = a31*o.m14 + a32*o.m24 + a33*o.m34 + a34*o.m44;
    this.m41 = a41*o.m11 + a42*o.m21 + a43*o.m31 + a44*o.m41;
    this.m42 = a41*o.m12 + a42*o.m22 + a43*o.m32 + a44*o.m42;
    this.m43 = a41*o.m13 + a42*o.m23 + a43*o.m33 + a44*o.m43;
    this.m44 = a41*o.m14 + a42*o.m24 + a43*o.m34 + a44*o.m44;
    if (!o.is2D) this.is2D = false;
    return this;
  }

  private _translateSelf(tx: number, ty: number, tz: number) {
    this.m41 += tx * this.m11 + ty * this.m21 + tz * this.m31;
    this.m42 += tx * this.m12 + ty * this.m22 + tz * this.m32;
    this.m43 += tx * this.m13 + ty * this.m23 + tz * this.m33;
    this.m44 += tx * this.m14 + ty * this.m24 + tz * this.m34;
    if (tz) this.is2D = false;
    return this;
  }

  private _scaleSelf(sx: number, sy: number, sz: number, ox: number, oy: number, oz: number) {
    this._translateSelf(ox, oy, oz);
    this.m11 *= sx; this.m12 *= sx; this.m13 *= sx; this.m14 *= sx;
    this.m21 *= sy; this.m22 *= sy; this.m23 *= sy; this.m24 *= sy;
    this.m31 *= sz; this.m32 *= sz; this.m33 *= sz; this.m34 *= sz;
    this._translateSelf(-ox, -oy, -oz);
    if (sz !== 1) this.is2D = false;
    return this;
  }

  private _invertSelf() {
    const m = this.toFloat64Array();
    const inv = new Float64Array(16);

    inv[0]  =  m[5]*m[10]*m[15] - m[5]*m[11]*m[14] - m[9]*m[6]*m[15] + m[9]*m[7]*m[14] + m[13]*m[6]*m[11] - m[13]*m[7]*m[10];
    inv[4]  = -m[4]*m[10]*m[15] + m[4]*m[11]*m[14] + m[8]*m[6]*m[15] - m[8]*m[7]*m[14] - m[12]*m[6]*m[11] + m[12]*m[7]*m[10];
    inv[8]  =  m[4]*m[9]*m[15]  - m[4]*m[11]*m[13] - m[8]*m[5]*m[15] + m[8]*m[7]*m[13] + m[12]*m[5]*m[11] - m[12]*m[7]*m[9];
    inv[12] = -m[4]*m[9]*m[14]  + m[4]*m[10]*m[13] + m[8]*m[5]*m[14] - m[8]*m[6]*m[13] - m[12]*m[5]*m[10] + m[12]*m[6]*m[9];
    inv[1]  = -m[1]*m[10]*m[15] + m[1]*m[11]*m[14] + m[9]*m[2]*m[15] - m[9]*m[3]*m[14] - m[13]*m[2]*m[11] + m[13]*m[3]*m[10];
    inv[5]  =  m[0]*m[10]*m[15] - m[0]*m[11]*m[14] - m[8]*m[2]*m[15] + m[8]*m[3]*m[14] + m[12]*m[2]*m[11] - m[12]*m[3]*m[10];
    inv[9]  = -m[0]*m[9]*m[15]  + m[0]*m[11]*m[13] + m[8]*m[1]*m[15] - m[8]*m[3]*m[13] - m[12]*m[1]*m[11] + m[12]*m[3]*m[9];
    inv[13] =  m[0]*m[9]*m[14]  - m[0]*m[10]*m[13] - m[8]*m[1]*m[14] + m[8]*m[2]*m[13] + m[12]*m[1]*m[10] - m[12]*m[2]*m[9];
    inv[2]  =  m[1]*m[6]*m[15]  - m[1]*m[7]*m[14]  - m[5]*m[2]*m[15] + m[5]*m[3]*m[14] + m[13]*m[2]*m[7]  - m[13]*m[3]*m[6];
    inv[6]  = -m[0]*m[6]*m[15]  + m[0]*m[7]*m[14]  + m[4]*m[2]*m[15] - m[4]*m[3]*m[14] - m[12]*m[2]*m[7]  + m[12]*m[3]*m[6];
    inv[10] =  m[0]*m[5]*m[15]  - m[0]*m[7]*m[13]  - m[4]*m[1]*m[15] + m[4]*m[3]*m[13] + m[12]*m[1]*m[7]  - m[12]*m[3]*m[5];
    inv[14] = -m[0]*m[5]*m[14]  + m[0]*m[6]*m[13]  + m[4]*m[1]*m[14] - m[4]*m[2]*m[13] - m[12]*m[1]*m[6]  + m[12]*m[2]*m[5];
    inv[3]  = -m[1]*m[6]*m[11]  + m[1]*m[7]*m[10]  + m[5]*m[2]*m[11] - m[5]*m[3]*m[10] - m[9]*m[2]*m[7]   + m[9]*m[3]*m[6];
    inv[7]  =  m[0]*m[6]*m[11]  - m[0]*m[7]*m[10]  - m[4]*m[2]*m[11] + m[4]*m[3]*m[10] + m[8]*m[2]*m[7]   - m[8]*m[3]*m[6];
    inv[11] = -m[0]*m[5]*m[11]  + m[0]*m[7]*m[9]   + m[4]*m[1]*m[11] - m[4]*m[3]*m[9]  - m[8]*m[1]*m[7]   + m[8]*m[3]*m[5];
    inv[15] =  m[0]*m[5]*m[10]  - m[0]*m[6]*m[9]   - m[4]*m[1]*m[10] + m[4]*m[2]*m[9]  + m[8]*m[1]*m[6]   - m[8]*m[2]*m[5];

    const det = m[0]*inv[0] + m[1]*inv[4] + m[2]*inv[8] + m[3]*inv[12];
    if (!det) return this;
    const id = 1 / det;
    for (let i = 0; i < 16; i++) inv[i] *= id;

    [
      this.m11, this.m12, this.m13, this.m14,
      this.m21, this.m22, this.m23, this.m24,
      this.m31, this.m32, this.m33, this.m34,
      this.m41, this.m42, this.m43, this.m44,
    ] = inv as unknown as number[];

    return this;
  }
}

export function installDOMMatrixPolyfill() {
  if (typeof globalThis.DOMMatrix === "undefined") {
    (globalThis as Record<string, unknown>).DOMMatrix = DOMMatrixPoly;
  }
}
