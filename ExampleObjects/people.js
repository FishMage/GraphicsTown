/**
 * Modified from  Leon Yang's human.js
 */
var grobjects = grobjects || [];

var Human = undefined;

(function () {
    "use strict";

  
    var shaderProgram = undefined;
    var cubeBuff = undefined;
	var crystalBuff = undefined;
    var humanIndex = 0;
	var parts = ['head', 'body', 'arm', 'leg'];

    Human = function Human(name, color, textureUrls) {
        this.name = name || "human"+humanIndex++;
        this.position = [-2,4,3];    // will be set in init
		this.color = color || {body: [1 * Math.random()*10, 0, 1],
						head: [0,0,0],
						arms: [0, 1, 1],
						legs: [0,0,0],};
        // about the Y axis - it's the facing direction
        this.orientation = Math.random() * 360;
		this.textureUrls = textureUrls;
		this.texes = {};
    }
    Human.prototype.init = function(drawingState) {
        var gl=drawingState.gl;

        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!cubeBuff) {
            var arrays = twgl.primitives.createCubeVertices(1);
			var cube = {vpos: arrays.position, vnormal: arrays.normal, indices: arrays.indices};
			cubeBuff = twgl.createBufferInfoFromArrays(gl, cube);
        }
		if(!crystalBuff){
		 var CrysArrays = {
                vpos : { numComponents: 3, data: [
                    -0.5, 1.0, -0.5,    // triangle 1
                    0.5, 1.0, -0.5,
                    0.0, 2.0,  0.0,
                    0.5, 1.0, -0.5,    // triangle 2
                    0.5, 1.0,  0.5,
                    0.0, 2.0,  0.0,
                    0.5, 1.0,  0.5,    // triangle 3
                    -0.5, 1.0,  0.5,
                    0.0, 2.0,  0.0,
                    -0.5, 1.0,  0.5,    // triangle 4
                    -0.5, 1.0, -0.5,
                    0.0, 2.0,  0.0,
                    //Lower
                    -0.5, 1.0, -0.5,    // triangle 5
                    0.5, 1.0, -0.5,
                    0.0, 0.0,  0.0,
                    0.5, 1.0, -0.5,    // triangle 6
                    0.5, 1.0,  0.5,
                    0.0, 0.0,  0.0,
                    0.5, 1.0,  0.5,    // triangle 7
                    -0.5, 1.0,  0.5,
                    0.0, 0.0,  0.0,
                    -0.5, 1.0,  0.5,    // triangle 8
                    -0.5, 1.0, -0.5,
                    0.0, 0.0,  0.0
                ] },
                vnormal : {numComponents:3, data: [
                    0,1,-1, 0,1,-1, 0,1,-1,   //0,1,-1, 0,1,-1, 0,1,-1,   
                    1,1,0,  1,1,0,  1,1,0,    //  1,1,0,  1,1,0,  1,1,0, 
                    0,1,1,  0,1,1, 0,1,1,      //  0,1,1, 0,1,1, 0,1,1,
                    -1,1,0, -1,1,0, -1,1,0,     //   -1,1,0, -1,1,0, -1,1,0,
                      //Lower
                    0,-1,-1, 0,-1,-1, 0,-1,-1, //  0,-1,-1, 0,-1,-1, 0,-1,-1,   
                    1,-1,0,  1,-1,0,  1,-1,0,    //  1,-1,0,  1,-1,0,  1,-1,0, 
                    0,-1,1,  0,-1,1, 0,-1,-1,      //  0,-1,1, 0,-1,1, 0,-1,1,
                    -1,-1,0, -1,-1,0, -1,-1,0   //    -1,-1,0, -1,-1,0, -1,-1,0,
               
                ]}
            };
            crystalBuff = twgl.createBufferInfoFromArrays(gl,CrysArrays);

		}
        this.position = [-20*Math.random()*5, 3, 23*Math.random()*3];
		this.limbAng = 0;
		this.prevState = 0;
        this.state = 0; // standing still
		this.randomWalk = true; // walking around
		this.currStride = Math.random() < 0.5 ? -1 : 1; // -1 for left and 1 for right
        this.wait = getRandomInt(250,750);
        this.lastTime = 0;
    };
    Human.prototype.draw = function(drawingState) {
        // make the human walk around
        // this will change position and orientation
		if (!drawingState.toFramebuffer)
			advance(this,drawingState);

        // we make a model matrix to place the cube in the world
		var centerMat = twgl.m4.identity();
		twgl.m4.rotateY(centerMat, this.orientation, centerMat);
        twgl.m4.setTranslation(centerMat, this.position, centerMat);
		twgl.m4.multiply(centerMat, twgl.m4.scaling([0.07, 0.07, 0.07]), centerMat);
		
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
		
		
		if (!drawingState.drawShadow)
			twgl.setUniforms(shaderProgram, { view:drawingState.view, proj:drawingState.proj, 
				depthMap: drawingState.depthMap, drawShadow: 0});
		else	
			twgl.setUniforms(shaderProgram, { view: drawingState.lightView, proj: drawingState.lightProj, 
				depthMap: drawingState.emptyBuff, drawShadow: 1});
		twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, lightView: drawingState.lightView, 
			lightProj: drawingState.lightProj});
			
		var normTrans = twgl.m4.identity();
		// draw body
		var bodyMat = twgl.m4.identity();
		twgl.m4.scale(bodyMat, [1.5, 2, 0.75], bodyMat);
		twgl.m4.multiply(bodyMat, centerMat, bodyMat);
		twgl.m4.transpose(twgl.m4.inverse(bodyMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {model: bodyMat, normTrans: normTrans, cubecolor: this.color.body});
		if (this.bodyTex) {
			twgl.setUniforms(shaderProgram, {useTexture: 1, uTexture: this.bodyTex});
		}
        twgl.setBuffersAndAttributes(gl,shaderProgram, cubeBuff);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		twgl.setUniforms(shaderProgram, {useTexture: 0});
		
		// draw head
		var headMat = twgl.m4.translation([0, 1.6, 0]);
		twgl.m4.multiply(headMat, centerMat, headMat);
		twgl.m4.transpose(twgl.m4.inverse(headMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {model: headMat, normTrans: normTrans, cubecolor: this.color.head});
		if (this.headTex) {
			twgl.setUniforms(shaderProgram, {useTexture: 1, uTexture: this.headTex});
		}
        twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		twgl.setUniforms(shaderProgram, {useTexture: 0});
		
		var sign = this.limbAng >= 0 ? 1 : -1;
		// draw left leg
		var leftLegMat = twgl.m4.identity();
		twgl.m4.scale(leftLegMat, [0.7, 2, 0.7], leftLegMat);
		twgl.m4.multiply(leftLegMat, twgl.m4.translation([0, -1, sign * 0.75 / 2]), leftLegMat);
		twgl.m4.multiply(leftLegMat, twgl.m4.rotationX(-this.limbAng), leftLegMat);
		twgl.m4.multiply(leftLegMat, twgl.m4.translation([0.75 / 2, -1, sign * -0.75 / 2]), leftLegMat);
		twgl.m4.multiply(leftLegMat, centerMat, leftLegMat);
		twgl.m4.transpose(twgl.m4.inverse(leftLegMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {model: leftLegMat, normTrans: normTrans, cubecolor: this.color.legs});
		if (this.legTex) {
			twgl.setUniforms(shaderProgram, {useTexture: 1, uTexture: this.legTex});
		}
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		twgl.setUniforms(shaderProgram, {useTexture: 0});
		
		// draw right leg
		var rightLegMat = twgl.m4.identity();
		twgl.m4.scale(rightLegMat, [0.7, 2, 0.7], rightLegMat);
		twgl.m4.multiply(rightLegMat, twgl.m4.translation([0, -1, -sign * 0.88 / 2]), rightLegMat);
		twgl.m4.multiply(rightLegMat, twgl.m4.rotationX(this.limbAng), rightLegMat);
		twgl.m4.multiply(rightLegMat, twgl.m4.translation([-0.88/ 2, -1, -sign * -0.88 / 2]), rightLegMat);
		twgl.m4.multiply(rightLegMat, centerMat, rightLegMat);
		twgl.m4.transpose(twgl.m4.inverse(rightLegMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {model: rightLegMat, normTrans: normTrans, cubecolor: this.color.legs});
		if (this.legTex) {
			twgl.setUniforms(shaderProgram, {useTexture: 1, uTexture: this.legTex});
		}
		twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		twgl.setUniforms(shaderProgram, {useTexture: 0});
		//draw sim crystal
		var crystalMat = twgl.m4.identity();
		crystalMat = twgl.m4.translation([0, 3.0, 0]);
		twgl.m4.multiply(crystalMat, centerMat, crystalMat);
		twgl.setBuffersAndAttributes(gl,shaderProgram,crystalBuff);
		//Spin
		var theta = Number(drawingState.realtime)/300.0;
        twgl.m4.rotateY(crystalMat, theta, crystalMat);
        //twgl.m4.setTranslation(crystalMat,this.position,crystalMat);

		twgl.m4.transpose(twgl.m4.inverse(crystalMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {model: crystalMat, normTrans: normTrans, cubecolor: [0,1,1]});
		twgl.drawBufferInfo(gl, gl.TRIANGLES, crystalBuff);

    };
    Human.prototype.center = function(drawingState) {
        return this.position;
    }


    // constants
	var rand = Math.random();
	if(rand >0.5)
    	var strideSpeed = 1.5*Math.random()/1000;          // radians per milli-second
	else	
		var strideSpeed = 1.5/800; 
    // utility - generate random  integer
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // this actually does the work
    function advance(human, drawingState) {
        // on the first call, the copter does nothing
        if (!human.lastTime) {
            human.lastTime = drawingState.realtime;
            return;
        }
        var delta = Math.min(50, drawingState.realtime - human.lastTime);
        human.lastTime = drawingState.realtime;
        // now do the right thing depending on state
        switch (human.state) {
            case 0: // standing still, waiting for action
                if (human.wait > 0) { human.wait -= delta; }
                else if (human.randomWalk) {
					human.wait = 0;
					var rand = Math.random();
					if (rand < 0.05) { // wait again
						human.prevState = 0;
						human.state = 0;
						human.wait = getRandomInt(200, 500);
					} else if (rand < 0.15) { // jump
						if (!human.jumpTime)
							human.jumpTime = 50;
					} else if (rand < 0.4) { // turn
						human.dstAng = (Math.random() - 0.5) * 2 * Math.PI;
					} else { // start to stride
						if (human.prevState != 2)
							human.currStride = Math.random() < 0.5 ? -1 : 1;
						human.prevState = 0;
						human.state = 1;
					}
                } else {
					if (drawingState.keysdown[87]) { // "w"
						if (!human.jumpTime)
							human.state = 1;
					}
				}
                break;
            case 1: 
                if (human.limbAng * human.currStride < 0.5) { // stride out
					var step = human.currStride * delta * strideSpeed;
                    human.position[1] = 2 * Math.cos(human.limbAng + step) + 1;
					var forward = human.currStride * 2 * (Math.sin(human.limbAng + step) - Math.sin(human.limbAng));
					human.position[0] += forward * Math.sin(human.orientation);
					human.position[2] += forward * Math.cos(human.orientation);
					human.limbAng += step;
                } else { // we've strode out to the farthest
					human.prevState = 1;
					human.state = 2;
                }
                break;
			case 2: 
				if (human.limbAng * human.currStride >  0) { // stride ending
					var step = human.currStride * delta * strideSpeed;
                    human.position[1] = 2 * Math.cos(human.limbAng - step) + 1;
					var forward = human.currStride * 2 * (Math.sin(human.limbAng) - Math.sin(human.limbAng - step));
					human.position[0] += forward * Math.sin(human.orientation);
					human.position[2] += forward * Math.cos(human.orientation);
					human.limbAng -= step;
                } else { // we've strode out to the farthest
					human.currStride *= -1;
					human.prevState = 2;
					human.state = 0;
                }
                break;
        }
		if (!human.randomWalk) {
			if (drawingState.keysdown[65]) {
				human.dstAng = 1;
			} else if (drawingState.keysdown[68]) {
				human.dstAng = -1;
			}
			if (drawingState.keysdown[32]) {
				if (!human.jumpTime) {
					human.jumpTime = 50;
				}
			}
		}
		if (human.dstAng) {
			var step = human.dstAng * 0.08;
			human.orientation += step;
			human.dstAng -= step;
			if (Math.abs(human.dstAng) < 0.001) {
				human.dstAng = 0;
			}
		}
    }
})();

// normally, I would put this into a "scene description" file, but having
// it here means if this file isn't loaded, then there are no dangling
// references to it

// make the objects and put them into the world

grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
grobjects.push(new Human());
