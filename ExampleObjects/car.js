
var grobjects = grobjects || [];

var Car = undefined;

(function () {
    "use strict";

  
    var shaderProgram = undefined;
    var cubeBuff = undefined;
    var carIndex = 0;
	var parts = ['head', 'body', 'arm', 'leg'];

    Car = function Car(name, color, textureUrls) {
        this.name = name || "Car" 
       // this.position = [4,4,6];    // will be set in init
		this.color = color || {body: [1 * Math.random()*10, 0.8, 0.3],
						head: [0,0,0],};
        // about the Y axis - it's the facing direction
        this.orientation = 90;
		this.textureUrls = textureUrls;
		this.texes = {};
    }
    Car.prototype.init = function(drawingState) {
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
		
        this.position = [-2.5,5 ,6];
		this.limbAng = 0;
		this.prevState = 0;
        this.state = 0; // standing still
		this.randomWalk = true; // walking around
		this.currStride = Math.random() < 0.5 ? -1 : 1; 
        this.wait = getRandomInt(250,750);
        this.lastTime = 0;
    };
    Car.prototype.draw = function(drawingState) {
        // make the human walk around
        // this will change position and orientation
		if (!drawingState.toFramebuffer)
			advance(this,drawingState);

        // we make a model matrix to place the cube in the world
		var centerMat = twgl.m4.identity();
		twgl.m4.rotateY(centerMat, this.orientation, centerMat);
        twgl.m4.setTranslation(centerMat, this.position, centerMat);
		twgl.m4.multiply(centerMat, twgl.m4.scaling([0.07, 0.07, 0.07]), centerMat);
		
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
		if (drawingState.drawShadow)
			twgl.setUniforms(shaderProgram, { view: drawingState.lightView, proj: drawingState.lightProj, 
				depthMap: drawingState.emptyBuff, drawShadow: 1});
		else 
			twgl.setUniforms(shaderProgram, { view:drawingState.view, proj:drawingState.proj, 
				depthMap: drawingState.depthMap, drawShadow: 0});
		twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, lightView: drawingState.lightView, 
			lightProj: drawingState.lightProj});
			
		var normTrans = twgl.m4.identity();
		// draw body
		var bodyMat = twgl.m4.identity();
		twgl.m4.scale(bodyMat, [5, 3, 7], bodyMat);
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
		var headMat = twgl.m4.translation([0, 1.5, 0]);
        twgl.m4.scale(headMat, [3, 2, 5], headMat);
		twgl.m4.multiply(headMat, centerMat, headMat);
		twgl.m4.transpose(twgl.m4.inverse(headMat, normTrans), normTrans);
		twgl.setUniforms(shaderProgram, {model: headMat, normTrans: normTrans, cubecolor: this.color.head});
		if (this.headTex) {
			twgl.setUniforms(shaderProgram, {useTexture: 1, uTexture: this.headTex});
		}
        twgl.drawBufferInfo(gl, gl.TRIANGLES, cubeBuff);
		twgl.setUniforms(shaderProgram, {useTexture: 0});
		

    };
    Car.prototype.center = function(drawingState) {
        return this.position;
    }


    // constants

		var strideSpeed = 1.5/100; 
    // utility - generate random  integer
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // this actually does the work
    function advance(car, drawingState) {
        // on the first call, the copter does nothing
        if (!car.lastTime) {
            car.lastTime = drawingState.realtime;
            return;
        }
        var delta = Math.min(50, drawingState.realtime - car.lastTime);
        car.lastTime = drawingState.realtime;
        // now do the right thing depending on state
        switch (car.state) {
            case 0: // standing still, waiting for action
                if (car.wait > 0) { car.wait -= delta; }
                else if (car.randomWalk) {
					car.wait = 0;
					var rand = Math.random();
					if (rand < 0.05) { // wait again
						car.prevState = 0;
						car.state = 0;
						car.wait = getRandomInt(200, 500);
					} else if (rand < 0.15) { // jump
						if (!car.jumpTime)
							car.jumpTime = 50;
					} else if (rand < 0.4) { // turn
						car.dstAng = (Math.random() - 0.5) * 2 * Math.PI;
					} else { // start to stride
						if (car.prevState != 2)
							car.currStride = Math.random() < 0.5 ? -1 : 1;
						car.prevState = 0;
						car.state = 1;
					}
                } 
                break;
            case 1: 
                if (car.limbAng * car.currStride < 0.5) { // stride out
					var step = car.currStride * delta * strideSpeed;
                    car.position[1] = 2 * Math.cos(car.limbAng + step) + 1;
					var forward = car.currStride * 2 * (Math.sin(car.limbAng + step) - Math.sin(car.limbAng));
					car.position[0] += forward * Math.sin(car.orientation);
					car.position[2] += forward * Math.cos(car.orientation);
					car.limbAng += step;
                } else { // we've strode out to the farthest
					car.prevState = 1;
					car.state = 2;
                }
                break;
			case 2: 
				if (car.limbAng * car.currStride >  0) { // stride ending
					var step = car.currStride * delta * strideSpeed;
                    car.position[1] = 2 * Math.cos(car.limbAng - step) + 1;
					var forward = car.currStride * 2 * (Math.sin(car.limbAng) - Math.sin(car.limbAng - step));
					car.position[0] += forward * Math.sin(car.orientation);
					car.position[2] += forward * Math.cos(car.orientation);
					car.limbAng -= step;
                } else { // we've strode out to the farthest
					car.currStride *= -1;
					car.prevState = 2;
					car.state = 0;
                }
                break;
        }
		
		if (car.dstAng) {
			var step = car.dstAng * 0.08;
			car.orientation += step;
			car.dstAng -= step;
			if (Math.abs(car.dstAng) < 0.001) {
				car.dstAng = 0;
			}
		}
    }
})();

// normally, I would put this into a "scene description" file, but having
// it here means if this file isn't loaded, then there are no dangling
// references to it

// make the objects and put them into the world

grobjects.push(new Car());
grobjects.push(new Car());
grobjects.push(new Car());
grobjects.push(new Car());

