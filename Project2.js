//Adam Hume - Project #2
/*
This no longer resembles the guide I followed "https://webgl2fundamentals.org/webgl/lessons/webgl-instanced-drawing.html"
I am still referencing it here as it is still technically built off the information I had learned from it

This uses no external libraries.
*/
// Gamepad
function gamepad() {
	// Grab the first connected gamepad
	const gp = navigator.getGamepads()[0];

	if (gp) {
		// axes[0] & axes[1] are Left Stick X & Y (-1.0 to 1.0)
		// axes[2] & axes[3] are Right Stick X & Y (-1.0 to 1.0)
		mx = gp.axes[0]*2;
		my = gp.axes[1];
		ax = gp.axes[2]*2;
		ay = gp.axes[3]*2;
			`Controller: ${gp.id}\n` +
			`Left Stick:  X = ${gp.axes[0].toFixed(2)}, Y = ${gp.axes[1].toFixed(2)}\n` +
			`Right Stick: X = ${gp.axes[2].toFixed(2)}, Y = ${gp.axes[3].toFixed(2)}`;
		jp = gp.buttons[0].value;
	}
}
// Degree Sine/Cosine functions (not used in this project)
Math.dsin = function(degrees) {
    return Math.sin(degrees * Math.PI / 180);
};
Math.dcos = function(degrees) {
    return Math.cos(degrees * Math.PI / 180);
};
// modulo function
function mod(num, mod) {
	return ((num % mod) + mod) % mod;
// clamp function
}
function clamp(val, min, max) { 
	return Math.min(Math.max(val, min), max);
}
// distance check (not used in this lab)
function checkdist(x1, y1, x2, y2, dist) {
	console.log(((x1-x2)**2+(y1-y2)**2)-dist**2);
	return (((x1-x2)**2+(y1-y2)**2)<=dist**2);
}
// angle fetch (not used in this lab)
function getangle(x1, y1, x2, y2) {
	return (Math.atan2(x1-x2,y1-y2));
}
// Obtains normal (used for projection matrix) (not used in this lab)
function getnormal(xw, yw, zw) {
	let l = Math.hypot(xw, yw, zw);
	return [xw /= l, yw /= l, zw /= l];
}
function mult4(mat1, mat2) {
	let mult = new Float32Array(16);
	for (let xi = 0; xi<4; xi++) {
		for (let yi = 0; yi<4; yi++) {
			for (let ii = 0; ii<4; ii++) {
				mult[xi + yi*4] += mat1[xi + ii*4] * mat2[ii + yi*4];
			}
		}
	}
	return mult;
}
// Obtains translation matrix
function matTrans(x,y,z) {
	return new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		x, y, z, 1
	])
}
// Obtains scale matrix
function matScale(sx,sy,sz) {
	return new Float32Array([
		sx, 0, 0, 0,
		0, sy, 0, 0,
		0, 0, sz, 0,
		0, 0, 0, 1
	])
}
// Obtains x rotation matrix
function matRotx(x,y,z,ang) {
	const c = Math.dcos(ang);
	const s = Math.dsin(ang);
	return new Float32Array([
		1, 0, 0, 0,
		0, c, -s, 0,
		0, s, c, 0,
		x, y, z, 1
	])
}
// Obtains y rotation matrix
function matRoty(ang) {
	const c = Math.dcos(ang);
	const s = Math.dsin(ang);
	return new Float32Array([
		c, 0, s, 0,
		0, 1, 0, 0,
		-s, 0, c, 0,
		0, 0, 0, 1
	])
}
// Obtains z rotation matrix
function matRotz(ang) {
	const c = Math.dcos(ang);
	const s = Math.dsin(ang);
	return new Float32Array([
		c, -s, 0, 0,
		s, c, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	])
}
// function for creating matrices from scratch (Left over from proj 1) (Not used in this lab)
function createMat(x, y, z, sx, sy, sz, angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	return new Float32Array([
		 c * sx,	s * sx,		0,			0,
		-s * sy,	c * sy,		0,			0,
		 0,			0,			1 * sz,		0,
		 x,			y,			z,			1
]);}
function rotMat(x, y, z, ax = 0, ay = 0, az = 0, ord = 'yxz') {
	const cx = Math.dcos(ax), sx = Math.dsin(ax);
	const cy = Math.dcos(ay), sy = Math.dsin(ay);
	const cz = Math.dcos(az), sz = Math.dsin(az);
	/*if (!ax&&!ay&&!az) {
		return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]);
	}*/
	switch(ord) {
		case 'yzx':
		return new Float32Array([
		 cy*cz,		sx*sy - cx*cy*sz,		cx*sy + cy*sx*sz,	0,
		 sz,		cx*cz,                 -cz*sx,				0,
		-cz*sy,		cy*sx + cx*sy*sz,		cx*cy - sx*sy*sz,	0,
		 x,			y,						z,					1
		]);
		break;
		case 'yxz':
		return new Float32Array([
		 cy*cz + sy*sx*sz,		sy*sx*cz - cy*sz, 	 sy*cx,		0,
		 cx*sz,					cx * cz,			-sx,		0,
		 cy*sx*sz - sy*cz,		sy*sz + cy*sx*cz,	 cy*cx,		0,
		 x,						y,					 z,			1
		]);
		break;
		case 'zxy':
		return new Float32Array([
		cy*cz-sx*sy*sz, -cx*sz, sy*cz+sx*cy*sz,	0,
		cy*sz+sx*sy*cz,  cx*cz, sy*sz-sx*cy*cz,	0,
		-cx*sy, sx, cx*cy,						0,
		x,				y,		z,				1
		]);
		break;
	}
}
// function for view matrix (not used in this lab)
function createView(x1, y1, z1, x2, y2, z2, xu, yu, zu) {
	z = getnormal(x1 - x2, y1 - y2, z1 - z2) // z-axis (forward)
	x = getnormal(yu*z[2] - zu*z[1], zu*z[0] - xu*z[2], xu*z[1] - yu*z[0]) // up x z-axis
	y = getnormal(z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]) // z-axis x x-axis
	
    return new Float32Array([
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
		// Translation
		-(x[0]*x1+x[1]*y1+x[2]*z1), -(y[0]*x1+y[1]*y1+y[2]*z1), -(z[0]*x1+z[1]*y1+z[2]*z1), 1
    ]);
}
// function for projection matrix (not used in this lab)
function createProj(fovy, aspect, near, far) {
	const f = 1.0 / Math.tan(fovy / 2);
    const ri = 1.0 / (near - far);

    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * ri, -1,
        0, 0, (near * far * ri) * 2, 0
    ]);
}

//Lab 3 variables

//sfx
const sndBwup = new Audio('bwup.mp3');
const sndFloof = new Audio('floof.mp3');
const sndFwip = new Audio('fwip.wav');
const sndPaff = new Audio('paff.mp3');

//WASD
var mx = 0;
var my = 0;

var jp = 0;

var scroll = 4;

//Arrows
var ax = 0;
var ay = 0;

var k1 = 0;
var xa = 0;

var k2 = 0;
var ya = 0;

var k3 = 0;
var za = 0;

var k4 = 0;
var k5 = 0;
var k6 = 0;
var k7 = 0;
var k8 = 0;
var k9 = 0;


//webgl canvas element
const canvas = document.getElementById("Canvas");

//get canvas to draw to
const gl = canvas.getContext("webgl2");

//enable depth testing
gl.enable(gl.DEPTH_TEST)

//enable culling
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);

//enable transparency (not utilized in this program)
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

//function to handle shader creation and errors
function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Shader compile error:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
	
}

//vertex shader source
const vSourceI = `#version 300 es
	in vec3 position;
	in vec3 color;
	in mat4 matrix;
	in mat3 shape;
	uniform mat4 view;
	uniform mat4 proj;
	//in vec2 inTexCoord;
	out vec4 inColor;
	out vec2 outTexCoord;

	void main() {
		vec3 pos = position;
		vec3 norm = position;
		if (pos.y<=shape[2][0]) {
			pos *= shape[0];
			norm = normalize(norm / shape[0]);
		}
		else if (pos.y>shape[2][1]) {
			pos *= shape[1];
			norm = normalize(norm / shape[1]);
			pos.y += shape[2][2];
		}
		else {
			float d = shape[2][1]-shape[2][0];
			float s = (pos.y-shape[2][0])/(d);
			vec2 ang = pos.xy;
			vec3 warp = (shape[1] * s) + (shape[0] * (1.0-s));
			pos *= warp;
			norm /= warp;
			normalize(norm);
			ang=ang*(shape[0].xy-shape[1].xy);
			norm.y *= (d)/(shape[2][2]+1.0);
			normalize(norm);
			norm.y+=length(ang)/shape[2][2];
			normalize(norm);
			pos.y += s * shape[2][2];
	}
    gl_Position = proj * view * matrix * vec4(pos, 1.0);

	vec3 viewNormal = normalize(mat3(view * matrix) * norm);
	float a = max(viewNormal.z, 0.0);
	float l = mix(0.15, 1.0, a);
	inColor = vec4(l * color.x, l * color.y, l * color.z, 1.0);
	//	outTexCoord = inTexCoord;
	}
	`;

const vSourceB = `#version 300 es
	in vec3 position;
	//in vec3 color;
	//in mat4 matrix;
	uniform mat4 view;
	uniform mat4 proj;
	in vec3 norm;
	in vec2 inTexCoord;
	out vec4 inColor;
	out vec2 outTexCoord;

	void main() {
		vec4 pos = view * vec4(position, 1.0);
		gl_Position = proj * pos;
		inColor = vec4((position+5.0)/10.0, 1.0);
		
		vec3 viewNormal = normalize(mat3(view) * norm);
		float d = length(pos.xyz);
		float a = max(viewNormal.z, 0.15) * max(1.0-(d*d)/200.0,0.0);
		float l = mix(0.0, 1.0, a);
		inColor = vec4(l, l, l, 1.0);
		outTexCoord = inTexCoord;
	}
	`;

//fragment shader source
const fSourceI = `#version 300 es
	precision highp float;
	in vec2 outTexCoord;
	//uniform sampler2D image;
	in vec4 inColor;
	out vec4 outColor;
 
	void main() {
		outColor = inColor; // * texture(image, outTexCoord);
	}
	`;
const fSourceB = `#version 300 es
	precision highp float;
	in vec2 outTexCoord;
	uniform sampler2D image;
	in vec4 inColor;
	out vec4 outColor;
 
	void main() {
		outColor = inColor * texture(image, outTexCoord);
	}
	`;

//creating shaders from source
const vShaderI = createShader(gl, gl.VERTEX_SHADER, vSourceI);
const vShaderB = createShader(gl, gl.VERTEX_SHADER, vSourceB);
const fShaderI = createShader(gl, gl.FRAGMENT_SHADER, fSourceI);
const fShaderB = createShader(gl, gl.FRAGMENT_SHADER, fSourceB);

//building/linking shader program
const program = gl.createProgram();
gl.attachShader(program, vShaderI);
gl.attachShader(program, fShaderI);
gl.linkProgram(program);

const program2 = gl.createProgram();
gl.attachShader(program2, vShaderB);
gl.attachShader(program2, fShaderB);
gl.linkProgram(program2);

objs=[[]]; //call length to get the number of objects to draw for an instance
class Room {
	constructor(xw, yw, zw, links = [0, 0, 0, 0, 0, 0]) {
		this.xw=xw;
		this.yw=yw;
		this.zw=zw;
		this.data = new Int8Array(xw * yw * zw);
		for(let xi=0; xi<xw; xi++) {
			for(let yi=0; yi<xw; yi++) {
				for(let zi=0; zi<xw; zi++) {
					if(xi==0||xi==(xw-1)||yi==0||yi==(yw-1)||zi==0||zi==(zw-1)) {
						this.data[xi + yi*xw + zi*xw*yw] = 1;
					}
				}
			}
		}
		this.addBlock(7,14,7,4);
		this.addBlock(8,14,7,4);
		this.addBlock(8,14,8,4);
		this.addBlock(7,14,8,4);
		this.verts=new Float32Array(xw*yw*zw*8*4);
		this.elems=new Uint16Array(xw*yw*zw*6);
		this.count=0;
		var ii=0;
		for(let xi=0; xi<xw; xi++) {
			for(let yi=0; yi<yw; yi++) {
				for(let zi=0; zi<zw; zi++) {
					let ti=13-this.data[xi+yi*xw+zi*xw*yw];
					let ty=(Math.trunc(ti/4))/4;
					let tx=(ti%4)/4;
					if(xi!=0) if(this.data[xi + yi*xw + zi*xw*yw]!=0&&this.data[(xi-1) + yi*xw + zi*xw*yw]==0) {
						let xpos = xi-(xw/2);//this
						let ypos = yi-(yw/2);
						let zpos = zi-(zw/2);
						let vi = ii*4;
						this.setVerts(xpos,ypos,zpos,-1,0,0,tx,ty,vi);
						this.elems.set([vi+1,vi,vi+2,vi+2,vi+3,vi+1],ii*6);
						ii++;
					}
					if(yi!=0) if(this.data[xi + yi*xw + zi*xw*yw]!=0&&this.data[xi + (yi-1)*xw + zi*xw*yw]==0) {
						let ypos = yi-(yw/2);
						let xpos = xi-(xw/2);
						let zpos = zi-(zw/2);
						let vi = ii*4;
						this.setVerts(xpos,ypos,zpos,0,-1,0,tx,ty,vi);
						this.elems.set([vi,vi+1,vi+3,vi+3,vi+2,vi],ii*6);
						ii++;
					}
					if(zi!=0) if(this.data[xi + yi*xw + zi*xw*yw]!=0&&this.data[xi + yi*xw + (zi-1)*xw*yw]==0) {
						let zpos = zi-(zw/2);//this
						let xpos = xi-(xw/2);
						let ypos = yi-(yw/2);
						let vi = ii*4;
						this.setVerts(xpos,ypos,zpos,0,0,-1,tx,ty,vi);
						this.elems.set([vi+1,vi,vi+2,vi+2,vi+3,vi+1],ii*6);
						ii++;
					}
					
					if(xi!=xw-1) if(this.data[xi + yi*xw + zi*xw*yw]!=0&&this.data[(xi+1) + yi*xw + zi*xw*yw]==0) {
						let xpos = xi-(xw/2-1);//this
						let ypos = yi-(yw/2);
						let zpos = zi-(zw/2);
						let vi = ii*4;
						this.setVerts(xpos,ypos,zpos,1,0,0,tx,ty,vi);
						this.elems.set([vi,vi+1,vi+3,vi+3,vi+2,vi],ii*6);
						ii++;
					}
					if(yi!=yw-1) if(this.data[xi + yi*xw + zi*xw*yw]!=0&&this.data[xi + (yi+1)*xw + zi*xw*yw]==0) {
						let ypos = yi-(yw/2-1);
						let xpos = xi-(xw/2);
						let zpos = zi-(zw/2);
						let vi = ii*4;
						this.setVerts(xpos,ypos,zpos,0,1,0,tx,ty,vi);
						this.elems.set([vi+1,vi,vi+2,vi+2,vi+3,vi+1],ii*6);
						ii++
					}
					if(zi!=zw-1) if(this.data[xi + yi*xw + zi*xw*yw]!=0&&this.data[xi + yi*xw + (zi+1)*xw*yw]==0) {
						let zpos = zi-(zw/2-1);
						let xpos = xi-(xw/2);
						let ypos = yi-(yw/2);
						let vi = ii*4;
						this.setVerts(xpos,ypos,zpos,0,0,1,tx,ty,vi);
						this.elems.set([vi,vi+1,vi+3,vi+3,vi+2,vi],ii*6);
						ii++;
					}
				}
			}
			this.count=(ii)*6;
		}
	}
	setVerts(x, y, z, nx, ny, nz, tx, ty, vi) {
		let w=0.002;
		if (nx) {
			this.verts.set([
				x, y, z, nx, 0, 0, tx+w, ty+w,
				x, y+1, z, nx, 0, 0, tx+w, ty+0.25-w,
				x, y, z+1, nx, 0, 0, tx+0.25-w, ty+w,
				x, y+1, z+1, nx, 0, 0, tx+0.25-w, ty+0.25-w
			], vi*8);
		}
		if (ny) {
			this.verts.set([
				x, y, z, 0, ny, 0, tx+w, ty+w,
				x+1, y, z, 0, ny, 0, tx+0.25-w, ty+w,
				x, y, z+1, 0, ny, 0, tx+w, ty+0.25-w,
				x+1, y, z+1, 0, ny, 0, tx+0.25-w, ty+0.25-w
			], vi*8);
		}
		if (nz) {
			this.verts.set([
				x, y, z, 0, 0, nz, tx+w, ty+w,
				x+1, y, z, 0, 0, nz, tx+0.25-w, ty+w,
				x, y+1, z, 0, 0, nz, tx+w, ty+0.25-w,
				x+1, y+1, z, 0, 0, nz, tx+0.25-w, ty+0.25-w
			], vi*8);
		}
	}
	addBlock (x,y,z,i) {
		this.data[x+y*this.xw+z*this.xw*this.yw] = i;
	}
}
class Member {
	constructor(mat = createMat(0,0,0,1,1,1,0,0), shp = new Float32Array([1, 1, 1, 1, 1, 1, 0, 0, 0]), col = new Float32Array([1, 1, 1]), child=[], type=0) {
		this.stip=0;
		this.mat=mat;
		this.base=new Float32Array(mat);
		this.x=mat[12];
		this.y=mat[13];
		this.z=mat[14];
		this.shp=shp; // Not used
		this.col=col;
		this.child=child;
		this.type=type;
		this.index=objs.length;
		objs[0].push(this);
		shpDat.set(shp, this.index*9);
		gl.bindBuffer(gl.ARRAY_BUFFER, sb);
		gl.bufferSubData(gl.ARRAY_BUFFER, this.index*4*9, shp);

		gl.bindBuffer(gl.ARRAY_BUFFER, cb);
		gl.bufferSubData(gl.ARRAY_BUFFER, this.index*4*3, col);

	}
	mult() {
		for(let i=0; i<this.child.length; i++) { // update each child's matrix
			this.child[i].mat.set(mult4(this.mat, this.child[i].base));
			this.child[i].mult() //go through each child's child
		}
		//matDat.set(this.mat, this.index*16);
		//gl.bindBuffer(gl.ARRAY_BUFFER, sb);
		//gl.bufferSubData(gl.ARRAY_BUFFER, this.index*4*16, this.mat);
	}
}
class Player {
	constructor(x, y, z) {
		this.canjump=false;
		this.count=0;
		this.speed=0;
		this.speed2=0;
		this.x=x;
		this.y=y;
		this.z=z;

		this.vx=0;
		this.vy=0;
		this.vz=0;

		this.ya=0;
		let white = new Float32Array([1,1,1]);
		let ltgry = new Float32Array([0.75,0.75,0.75]);
		let graey = new Float32Array([0.5,0.5,0.5]);
		let dkgry = new Float32Array([0.25,0.25,0.25]);
		let black = new Float32Array([0,0,0]);
						this.lhand = new Member(matTrans(0,0.2,0), new Float32Array([0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0, 0, 0]));
					this.llarm = new Member(matTrans(0,0.15,0), new Float32Array([0.05, 0.05, 0.05, 0.08, 0.08, 0.08, -0.2, 0.2, 0.15]), ltgry, [this.lhand]);
				this.ularm = new Member(createMat(-0.12,0.0,0,1,1,1,Math.PI/12,0), new Float32Array([0.04, 0.04, 0.04, 0.05, 0.05, 0.05, -0.2, 0.2, 0.15]), ltgry, [this.llarm]);

						this.rhand = new Member(matTrans(0,0.2,0), new Float32Array([0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0, 0, 0]));
					this.lrarm = new Member(matTrans(0,0.15,0), new Float32Array([0.05, 0.05, 0.05, 0.08, 0.08, 0.08, -0.2, 0.2, 0.15]), ltgry, [this.rhand]);
				this.urarm = new Member(createMat(0.12,0.0,0,1,1,1,-Math.PI/12,0), new Float32Array([0.04, 0.04, 0.04, 0.05, 0.05, 0.05, -0.2, 0.2, 0.15]), ltgry, [this.lrarm]);

			this.chest = new Member(matTrans(0,0.05,0), new Float32Array([0.18, 0.1, 0.1, 0.07, 0.07, 0.05, 0.0, 1, 0.1]), graey, [this.ularm, this.urarm]);
			
					this.lfoot = new Member(matRotx(0,0.25,0,80), new Float32Array([0.03, 0.04, 0.04, 0.04, 0.04, 0.02, 0.0, 0.2, 0.07]));
				this.llleg = new Member(matTrans(0,0.25,0), new Float32Array([0.05, 0.05, 0.05, 0.03, 0.04, 0.04, -0.2, 0.2, 0.25]), white, [this.lfoot]);
			this.ulleg = new Member(matTrans(-0.06,0.3,0), new Float32Array([0.05, 0.05, 0.05, 0.08, 0.08, 0.08, -0.2, 0.2, 0.25]), dkgry, [this.llleg]);

					this.rfoot = new Member(matRotx(0,0.25,0,80), new Float32Array([0.03, 0.04, 0.04, 0.04, 0.04, 0.02, 0.0, 0.2, 0.07]));
				this.lrleg = new Member(matTrans(0,0.25,0), new Float32Array([0.05, 0.05, 0.05, 0.03, 0.04, 0.04, -0.2, 0.2, 0.25]), white, [this.rfoot]);
			this.urleg = new Member(matTrans(0.06,0.3,0), new Float32Array([0.05, 0.05, 0.05, 0.08, 0.08, 0.08, -0.2, 0.2, 0.25]), dkgry, [this.lrleg]);
			
				this.hair = new Member(matRotx(0,-0.02,0.0,-60), new Float32Array([0.11, 0.11, 0.11, 0.2, 0.05, 0.05, 0.0, 0.2, 0.3]), dkgry);
			this.head = new Member(matRotx(0,-0.15,-0.02,30), new Float32Array([0.1, 0.1, 0.1, 0.07, 0.07, 0.05, 0.0, 1, 0.07]), white, [this.hair]);
		this.body = new Member(createMat(x,y-0.83,z,1,1,1,0,0), new Float32Array([0.10, 0.05, 0.05, 0.15, 0.05, 0.10, -0.2, 0.2, 0.3]), graey, [this.ulleg, this.urleg, this.head, this.chest]);
	}
	step() {
		//let mx=1;
		this.speed=(my+this.speed*5) / 6;
		this.ya-=mx*2;
		let sp = Math.abs(this.speed);
		if (this.canjump) {
			this.vx = this.speed*0.1*-Math.dsin(this.ya);
			this.vz = this.speed*0.1*Math.dcos(this.ya);
		}
		else {
			this.vx += this.speed*0.0025*-Math.dsin(this.ya);
			this.vz += this.speed*0.0025*Math.dcos(this.ya);
		}
		this.vy += 0.01 - this.canjump*jp*0.2;
		if (this.canjump&&jp) {this.canjump=false; sndFwip.play();}
		if (this.check(this.x+this.vx, this.y, this.z)) this.x+=this.vx;
		if (this.check(this.x, this.y, this.z+this.vz)) this.z+=this.vz;
		if (this.check(this.x, this.y+this.vy, this.z)) this.y+=this.vy;
		
		this.count=(this.count+5+5*sp);
		if (my) {
			if (!this.stip&&this.count>180) {sndPaff.currentTime = 0; sndPaff.play(); this.stip=1;}
			if (this.count>360) {this.count-=360; sndPaff.currentTime = 0; sndPaff.play(); this.stip=0;}
		}
		let rot1=45*Math.dsin(this.count);
		let rot3=45*Math.dsin(this.count+90);
		let rot5=-Math.dcos(this.count*2);
		if (!this.canjump) {
			if (this.count<180) this.count=(90+this.count*3)/4+this.vy*30;
			else this.count=(270+this.count*3)/4+this.vy*30;
			}

		this.hair.base=matRotx(this.hair.x,this.hair.y,this.hair.z,sp*rot5*2+Math.min(this.speed,0.5)*30-60);

		this.body.mat=rotMat(this.x,this.y+sp*-rot5*0.02-0.83,this.z, 0, this.ya, 0);
		//this.pos[1]=abs(speed)*rot5;

		//this.ulleg.pos[0]=speed*(rot1/45);
		//this.urleg.pos[0]=speed*(-rot1/45);

		this.ulleg.base=matRotx(this.ulleg.x,this.ulleg.y,this.ulleg.z,(9+rot1)*sp);
		this.urleg.base=matRotx(this.urleg.x,this.urleg.y,this.urleg.z,(9-rot1)*sp);
		//this.ulleg.rot=speed*(9+rot1);
		//this.urleg.rot=speed*(9-rot1);

		this.llleg.base=matRotx(this.llleg.x,this.llleg.y,this.llleg.z,(-45-rot3)*sp);
		this.lrleg.base=matRotx(this.lrleg.x,this.lrleg.y,this.lrleg.z,(-45+rot3)*sp);
		//this.llleg.rot=speed*(-45-rot3);
		//this.lrleg.rot=speed*(-45+rot3);

		this.chest.base=rotMat(this.chest.x,this.chest.y,this.chest.z,0,(-rot1*0.5)*sp,0);
		//this.urarm.pos[0]=speed*(rot1/30);
		//this.ularm.pos[0]=speed*(-rot1/30);

		this.urarm.base=rotMat(this.urarm.x,this.urarm.y,this.urarm.z,(rot1-18)*sp,0,15.0+15.0*sp);
		this.ularm.base=rotMat(this.ularm.x,this.ularm.y,this.ularm.z,(-rot1-18)*sp,0,-15.0-15.0*sp);
		//this.urarm.rot=speed*(rot1-18);
		//this.ularm.rot=speed*(-rot1-18);

		this.lrarm.base=matRotx(this.lrarm.x,this.lrarm.y,this.lrarm.z,sp*(45+rot1*2/3));
		this.llarm.base=matRotx(this.llarm.x,this.llarm.y,this.llarm.z,sp*(45-rot1*2/3));
		//this.lrarm.rot=speed*(45+rot1*2/3);
		//this.llarm.rot=speed*(45-rot1*2/3);
		if (k1) {alert(`${this.x} ${this.y} ${this.z}`); k1=0;}
		if (k2) {alert(this.check(this.x, this.y, this.z)); k2=0;}
	}
	check(x, y, z) {
		let rx=x+room.xw/2;
		let ry=y+room.yw/2-0.5;
		let rz=z+room.zw/2;
		let dx=Math.trunc(rx);
		let dy=Math.trunc(ry);
		let dz=Math.trunc(rz);
		let fx=rx%1;
		let fy=ry%1;
		let fz=rz%1;
		let sx=Math.round(fx);
		let sy=Math.round(fy);
		let sz=Math.round(fz);

		let xc=(fx>0.75||fx<0.25);
		let yc=(fy>0.5||fy<0.5);
		let zc=(fz>0.75||fz<0.25);
		let ret = true;
		//alert(`index: ${dx+dy*room.xw+dz*room.xw*room.zw} x: ${dx} y: ${dy} z: ${dz}`);
		if (room.data[dx+dy*room.xw+dz*room.xw*room.zw]) {return false;}

		//Check sides
		if (yc) {
			if (room.data[dx+(dy-1+2*sy)*room.xw+dz*room.xw*room.zw]) {this.vy=0; if (!this.canjump) {sndFloof.play()}; this.canjump=true; this.y=dy-room.yw/2+1; ret = false;}
			//Check edge (xy)
			if (yc&&Math.hypot(rx-dx,ry-dy-0.25+sy*0.5)<0.25) {
				if (room.data[(dx-1+2*sx)+(dy-1+2*sy)*room.xw+dz*room.xw*room.zw]) {this.getTanVel(0.5-fx,0.5-fy,0); ret = false;}
				//Check corner (xyz)
				if (Math.hypot(rx-dx,ry-dy-0.25+sy*0.5,rz-dz)<0.25) {
					if (room.data[(dx-1+2*sx)+(dy-1+2*sy)*room.xw+(dz-1+2*sz)*room.xw*room.zw]) {this.getTanVel(0.5-fx,0.5-fy,0.5-fz); ret = false;}
				}
			}
			//check edge (yz)
			if (zc&&Math.hypot(ry-dy-0.25+sy*0.5,rz-dz)<0.25) {
				if (room.data[dx+(dy-1+2*sy)*room.xw+(dz-1+2*sz)*room.xw*room.zw]) {this.getTanVel(0,0.5-fy,0.5-fz); ret = false;}
			}
		}
		if (xc) {
			if (room.data[(dx-1+2*sx)+dy*room.xw+dz*room.xw*room.zw]) {this.vx=0; this.x=dx-room.xw/2+0.25+0.50*sx; ret = false;}
			//Check edge (xz)
			if (zc&&Math.hypot(rx-dx,rz-dz)<0.25) {
				if (room.data[(dx-1+2*sx)+dy*room.xw+(dz-1+2*sz)*room.xw*room.zw]) {this.getTanVel(0.5-fx,0,0.5-fz); ret = false;}
			}
		}
		if (zc) {
			if (room.data[dx+dy*room.xw+(dz-1+2*sz)*room.xw*room.zw]) {this.vz=0; this.z=dz-room.zw/2+0.25+0.50*sz; ret = false;}
		}
		let eyes = [eye1,eye2,eye3,eye4]
		let xsn = (Math.sign(this.x)>0)*1;
		let ysn = (Math.sign(this.z)>0)*2;
		let nx=this.x-eyes[xsn+ysn].x;
		let ny=this.y-eyes[xsn+ysn].y-0.25;
		let nz=this.z-eyes[xsn+ysn].z;
		if (k3) {alert(`${xsn} | ${ysn}`);}
		if (Math.hypot(nx,ny,nz)<1.25) {this.getTanVel(nx,ny,nz); this.vx+=nx/5; this.vy+=ny/5; this.vz+=nz/5; if (this.canjump) ret=false; sndBwup.play();}
		return ret;
	}
	getTanVel(nx,ny,nz) {
		let norm = getnormal(nx, ny, nz);
		let dot = this.vx * norm[0] + this.vy * norm[1] + this.vz * norm[2];
		this.vx-=dot * norm[0];
		this.vy-=dot * norm[1];
		this.vz-=dot * norm[2];
	}
}
class Eye {
	constructor(x, y, z) {
		this.x=x;
		this.y=y;
		this.z=z;
		this.ax=0;
		this.ay=0;
		let white=new Float32Array([1.0,1.0,1.0]);
		let green=new Float32Array([0.0,1.0,0.0]);
		let black=new Float32Array([0.0,0.0,0.0]);
				this.pupil=new Member(matTrans(0.25,-0.1,0), new Float32Array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -1, 1, 0.2]), black);
			this.iris=new Member(matTrans(0.3,0,0), new Float32Array([0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0, 0, 0]), green, [this.pupil]);
		this.ball=new Member(matTrans(x,y,z), new Float32Array([1, 1, 1, 1, 1, 1, 0, 0, 0]), white, [this.iris]);
		this.ball.mult();
	}
	step() {
		let run=Math.hypot(player.x-this.x,player.z-this.z);
		let rize=this.y-player.y+0.5;
		this.ball.mat=rotMat(this.x,this.y,this.z,0,90-Math.atan2(player.x-this.x,player.z-this.z)/(Math.PI/180),Math.atan2(rize,run)/(Math.PI/180),'zxy');
		this.ball.mult();
	}
}
class PhyObj {
	constructor(x, y, a, vx, vy, va, type, col) {
		this.x=x;
		this.y=y;
		this.a=a;
		this.vx=vx;
		this.vy=vy;
		this.va=va;
		this.type=type;//types: Ship=0, bullet=1, blast=2, tri=3, quad=4, pent=5, hex=6, sept=7, oct=8
		this.col=col;
		this.time=0;
		objs[type].push(this);
	}
	step() {
		this.time *= 0.001; // seconds

		this.x+=this.vx*0.003125;
		this.y+=this.vy*0.003125;
		this.a-=this.va*0.05;

	}
	delete() {
		objs[this.type].splice(objs[this.type].indexOf(this), 1);
	}
}
class Ship extends PhyObj {
	constructor(x, y) {
		super(x, y, 0, 0, 0, 0, 0, [0.0, 1.0, 1.0, 1.0]);
		this.s=0.3;
		this.cool=0;
	}
	step() {
	}
}

// Using a function from this optimized icomesh library: https://github.com/mourner/icomesh?tab=ISC-1-ov-file 
// ISC License
// Copyright (c) 2019, Vladimir Agafonkin
icosphere = (order = 0) => {
  // set up a 20-triangle icosahedron
  const f = (1 + 5 ** 0.5) / 2;
  const T = 4 ** order;

  const vertices = new Float32Array((10 * T + 2) * 3);
  vertexWip = Float32Array.of(
    -1,  f,  0, 	1,  f,  0,	 	-1, -f,  0, 	 1, -f,  0, 
     0, -1,  f, 	0,  1,  f,	 	 0, -1, -f, 	 0,  1, -f, 
     f,  0, -1, 	f,  0,  1, 		-f,  0, -1, 	-f,  0,  1);
	 //alteration to rotate vertices
	 let ang =  69.0948425/2;
	 for(let i=0; i<36; i+=3) {
		let v=[vertexWip[i] * Math.dcos(ang) - vertexWip[i+1] * Math.dsin(ang),
		vertexWip[i] * Math.dsin(ang) + vertexWip[i+1] * Math.dcos(ang)]
		vertexWip.set(v,i);
	 }
  vertices.set(vertexWip);

  let triangles = Uint32Array.of(
    0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 
    11, 10, 2, 5, 11, 4, 1, 5, 9, 7, 1, 8, 10, 7, 6, 
    3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 
    9, 8, 1, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7);

  let v = 12;
  const midCache = order ? new Map() : null; // midpoint vertices cache to avoid duplicating shared vertices

  function addMidPoint(a, b) {
    const key = Math.floor((a + b) * (a + b + 1) / 2) + Math.min(a, b); // Cantor's pairing function
    let i = midCache.get(key);
    if (i !== undefined) { midCache.delete(key); return i; }
    midCache.set(key, v);
    for (let k = 0; k < 3; k++) vertices[3 * v + k] = (vertices[3 * a + k] + vertices[3 * b + k]) / 2;
    i = v++;
    return i;
  }

  let trianglesPrev = triangles;
  for (let i = 0; i < order; i++) {
    // subdivide each triangle into 4 triangles
    triangles = new Uint32Array(trianglesPrev.length * 4);
    for (let k = 0; k < trianglesPrev.length; k += 3) {
      const v1 = trianglesPrev[k + 0];
      const v2 = trianglesPrev[k + 1];
      const v3 = trianglesPrev[k + 2];
      const a = addMidPoint(v1, v2);
      const b = addMidPoint(v2, v3);
      const c = addMidPoint(v3, v1);
      let t = k * 4;
      triangles[t++] = v1; triangles[t++] = a; triangles[t++] = c;
      triangles[t++] = v2; triangles[t++] = b; triangles[t++] = a;
      triangles[t++] = v3; triangles[t++] = c; triangles[t++] = b;
      triangles[t++] = a;  triangles[t++] = b; triangles[t++] = c;
    }
    trianglesPrev = triangles;
  }
  // normalize vertices
  for (let i = 0; i < vertices.length; i += 3) {
    const m = 1 / Math.hypot(vertices[i + 0], vertices[i + 1], vertices[i + 2]);
    vertices[i + 0] *= m;
    vertices[i + 1] *= m;
    vertices[i + 2] *= m;
  }
  return [vertices, triangles];
}
///////////////////////////////////////////////////////////////////////////////////

var ico1 = icosphere(1);

//create 

//start here

const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

//Setting all attribute locations
const posLoc = gl.getAttribLocation(program, 'position');
const colLoc = gl.getAttribLocation(program, 'color');
const matLoc = gl.getAttribLocation(program, 'matrix');
const shpLoc = gl.getAttribLocation(program, 'shape');
const viewLoc = gl.getUniformLocation(program, 'view');
const projLoc = gl.getUniformLocation(program, 'proj');
//const texLoc = gl.getAttribLocation(program, "inTexCoord");

const posLoc2 = gl.getAttribLocation(program2, 'position');
const viewLoc2 = gl.getUniformLocation(program2, 'view');
const projLoc2 = gl.getUniformLocation(program2, 'proj');
const texLoc2 = gl.getAttribLocation(program2, "inTexCoord");
const norLoc2 = gl.getAttribLocation(program2, "norm");

//alert(`pos: ${posLoc2} view: ${viewLoc2} proj ${projLoc2} tex ${texLoc2} nor ${norLoc2}`);

const matDat = new Float32Array(32 * 16);//FIXME
const mb = gl.createBuffer();

const shpDat = new Float32Array(32 * 9);//FIXME
const sb = gl.createBuffer();

const colDat = new Float32Array(32 * 3);//FIXME
const cb = gl.createBuffer();
//fromhere
const verts=[ico1[0]];
const indexs=[ico1[1]];

const vao = [];
const pb = [];
const ib = [];

var room = new Room(16,16,16);

//batch stuff
const vaob = gl.createVertexArray();
	gl.bindVertexArray(vaob);
const pbb = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pbb);
	gl.bufferData(gl.ARRAY_BUFFER, room.verts, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(posLoc2);
	gl.vertexAttribPointer(posLoc2, 3, gl.FLOAT, false, 8 * FLOAT_SIZE, 0);
	gl.enableVertexAttribArray(norLoc2);
	gl.vertexAttribPointer(norLoc2, 3, gl.FLOAT, false, 8 * FLOAT_SIZE, 3 * FLOAT_SIZE);
	gl.enableVertexAttribArray(texLoc2);
	gl.vertexAttribPointer(texLoc2, 3, gl.FLOAT, false, 8 * FLOAT_SIZE, 6 * FLOAT_SIZE);
const ibb = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibb);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, room.elems, gl.STATIC_DRAW);

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
		gl.RGBA, gl.UNSIGNED_BYTE,
		new Uint8Array([255, 255, 255, 255])
	);

	const image = new Image();
	//image.crossOrigin = "anonymous"; 
	image.src = "Tiles.png"; // Replace with your local path/PNG file
	image.onload = () => {
    	gl.bindTexture(gl.TEXTURE_2D, texture);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
    	// WebGL2 can automatically generate mipmaps for any image dimensions
    	gl.generateMipmap(gl.TEXTURE_2D);
    
    	// Trigger render after image loads
    	render();
	};
//
for (i of objs.keys()) {
// Create & bind vertex array object
vao.push(gl.createVertexArray());
gl.bindVertexArray(vao[i]);

// buffer for position data //////////////////////////////////////////////////
pb.push(gl.createBuffer());
gl.bindBuffer(gl.ARRAY_BUFFER, pb[i]);
gl.bufferData(gl.ARRAY_BUFFER, verts[i], gl.STATIC_DRAW);

ib.push(gl.createBuffer());
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib[i]);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexs[i], gl.STATIC_DRAW);

// position attribute setup
gl.enableVertexAttribArray(posLoc);
//gl.enableVertexAttribArray(colLoc);

// Position Attribute (x, y, z)
gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

// Color Attribute (R, G, B)
//gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE);

// buffer for matrix data (NOT USED IN THIS LAB) //////////////////////////////////////////////////
gl.bindBuffer(gl.ARRAY_BUFFER, mb);
gl.bufferData(gl.ARRAY_BUFFER, matDat.byteLength, gl.DYNAMIC_DRAW);

const bytesPerMatrix = 4 * 16;
for (let i = 0; i < 4; ++i) {
	const loc = matLoc + i;
	gl.enableVertexAttribArray(loc);
	const offset = i * 16;  // 4 floats per row, 4 bytes per float
	gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, offset);
	gl.vertexAttribDivisor(loc, 1);
}

gl.bindBuffer(gl.ARRAY_BUFFER, sb);
gl.bufferData(gl.ARRAY_BUFFER, shpDat.byteLength, gl.DYNAMIC_DRAW);

const bytesPerShape = 4 * 9;
for (let i = 0; i < 3; ++i) {
	const loc = shpLoc + i;
	gl.enableVertexAttribArray(loc);
	const offset = i * 12;  // 3 floats per row, 4 bytes per float
	gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, bytesPerShape, offset);
	gl.vertexAttribDivisor(loc, 1);
}

gl.bindBuffer(gl.ARRAY_BUFFER, cb);
gl.bufferData(gl.ARRAY_BUFFER, colDat.byteLength, gl.DYNAMIC_DRAW);

const bytesPerColor = 4 * 3
gl.enableVertexAttribArray(colLoc);
gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, bytesPerColor, 0);
gl.vertexAttribDivisor(colLoc, 1);


}


//var player = new Ship(0, 0);
alert('loaded');
var player = new Player(0, 0, 0);
var eye1 = new Eye(-6,6,-6);
var eye2 = new Eye(6,6,-6);
var eye3 = new Eye(-6,6,6);
var eye4 = new Eye(6,6,6);
/*
var mshp = new Float32Array([0.22, 0.22, 0.22, 0.25, 0.25, 0.25, -0.2, 0.2, 1	])

var memb = new Member(
	createMat(0, 0, 0, 1, 1, 1, 0, 0),
	mshp,
	[
		new Member(
			createMat(0, 1, 0, 1, 1, 1, 0, 0),
			mshp,
//			[
//				new Member(
//					createMat(0, 1, 0, 1, 1, 1, 0, 0),
//					mshp
				)
//			])
	]
);
*/

//alert(test.data);

//alert(objs[0][0].mat);
//alert(objs[0][0].shp);

//memb.mult()
//alert(memb.mat);
//alert(memb.child[0].mat);

//var player2 = new Ship(0.5, 0.5);

gl.useProgram(program);

var m1a = 0;
var m2a = 0;
//Rendering function

function render(time) {
	player.step();
	eye1.step();
	eye2.step();
	eye3.step();
	eye4.step();
	gamepad();
	xa+=ax;
	ya+=ay;
	ya=clamp(ya, -89, 89);

	//memb.mat=createMat(0, 0, 0, 1, 1, 1, m1a, 0);
	//memb.child[0].base=createMat(0, 1, 0, 1, 1, 1, m2a, 0);
	player.body.mult();
	let x = player.head.mat[12];
	let y = player.head.mat[13];
	let z = player.head.mat[14];
	let view = createView(scroll*Math.dsin(xa-player.ya)*Math.dcos(ya)+x, scroll*Math.dsin(ya)+y, scroll*Math.dcos(xa-player.ya)*Math.dcos(ya)+z, x, y, z, 0, -1, 0);
	let proj = createProj(Math.PI/3.0, 1.0, 0.1, 100.0)
	gl.uniformMatrix4fv(viewLoc, false, view);
	gl.uniformMatrix4fv(projLoc, false, proj);
	//gl.uniformMatrix4fv(rotxLoc, false, matRotx(ya));
	//gl.uniformMatrix4fv(rotyLoc, false, matRoty(za));
	//gl.uniformMatrix4fv(transLoc, false, matTrans(xx,yy,zz));
	//gl.uniformMatrix4fv(scaleLoc, false, matScale(xs,ys,zs));

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	time *= 0.001; // seconds
 
	// Convert clip space to pixels
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	//batch shader
	gl.bindVertexArray(vaob);
	gl.useProgram(program2);
	gl.uniformMatrix4fv(viewLoc2, false, view);
	gl.uniformMatrix4fv(projLoc2, false, proj);
	gl.drawElements(gl.TRIANGLES, room.count, gl.UNSIGNED_SHORT, 0)

	gl.useProgram(program);
	
	//messy iterative instanced rendering code

	//iterate across different objects
	for(i of Object.keys(objs).reverse()) {
		gl.bindVertexArray(vao[i]);

		//iterate across object instances
		for(ii of Object.keys(objs[i]).reverse()) {
			var obj=objs[i][ii];
			//obj.step();
			matDat.set(obj.mat, ii*16);
			shpDat.set(obj.shp, ii*9);
			colDat.set(obj.col, ii*3);
		};
		gl.bindBuffer(gl.ARRAY_BUFFER, mb);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, matDat);

		gl.bindBuffer(gl.ARRAY_BUFFER, sb);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, shpDat);

		gl.bindBuffer(gl.ARRAY_BUFFER, cb);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, colDat);

		gl.drawElementsInstanced(gl.TRIANGLES, indexs[0].length, gl.UNSIGNED_INT, 0, objs[0].length);
	}
	//gl.drawElementsInstanced(gl.TRIANGLES, indexs[0].length, gl.UNSIGNED_SHORT, 0, 1);
	requestAnimationFrame(render);
}


//1-9 controls
document.addEventListener('keydown', (event) => {
	console.log(`Key pressed: ${event.key} | Code: ${event.code}`);
	switch(event.key) {
		case '1': k1=1; break;
		case '2': k2=1; break;
		case '3': k3=1; break;
		case '4': k4=1; break;
		case '5': k5=1; break;
		case '6': k6=1; break;
		case '7': k7=1; break;
		case '8': k8=1; break;
		case '9': k9=1; alert(memb.mat); break;

		case 'W': case 'w':		if (my!=-1)	my-=1; break;
		case 'S': case 's':		if (my!=1) 	my+=1; break;
		case 'A': case 'a':		if (mx!=-1)	mx-=1; break;
		case 'D': case 'd':		if (mx!=1) 	mx+=1; break;

		case 'ArrowUp': 	if (ay!=-1)	ay-=1; break;
		case 'ArrowDown': 	if (ay!=1) 	ay+=1; break;
		case 'ArrowLeft': 	if (ax!=-1)	ax-=1; break;
		case 'ArrowRight': 	if (ax!=1) 	ax+=1; break;

		case ' ': jp=1; break;
	}
});

//control releases
document.addEventListener('keyup', (event) => {
	console.log(`Key released: ${event.key} | Code: ${event.code}`);
	switch(event.key) {
		case '1': k1=0; break;
		case '2': k2=0; break;
		case '3': k3=0; break;
		case '4': k4=0; break;
		case '5': k5=0; break;
		case '6': k6=0; break;
		case '7': k7=0; break;
		case '8': k8=0; break;
		case '9': k9=0; break;

		case 'W': case 'w':		if (my!=1) 	my+=1; break;
		case 'S': case 's':		if (my!=-1)	my-=1; break;
		case 'A': case 'a':		if (mx!=1) 	mx+=1; break;
		case 'D': case 'd':		if (mx!=-1)	mx-=1; break;

		case 'ArrowUp': 	if (ay!=1) 	ay+=1; break;
		case 'ArrowDown': 	if (ay!=-1)	ay-=1; break;
		case 'ArrowLeft': 	if (ax!=1) 	ax+=1; break;
		case 'ArrowRight': 	if (ax!=-1)	ax-=1; break;

		case ' ': jp = 0; break;
	}
});
document.addEventListener("wheel", (event) => {
	scroll= Math.max(scroll + event.deltaY*0.001,0.01);
	//alert(scroll);
});
