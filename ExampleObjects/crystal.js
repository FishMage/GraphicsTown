/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the cube is more complicated since it is designed to allow making many cubes

 we make a constructor function that will make instances of cubes - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all cubes - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each cube instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Crystal = undefined;
var SpinningCrystal = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Crystal = function Crystal(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = (size+0.01)%2 || 1.0;
        this.color = color || [.7,.8,.9];
    }
    Crystal.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!buffers) {
            var arrays = {
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
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Crystal.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Crystal.prototype.center = function(drawingState) {
        return this.position;
    }


    ////////
    // constructor for Cubes
    SpinningCrystal = function SpinningCube(name, position, size, color, axis) {
        Crystal.apply(this,arguments);
        this.axis = axis || 'X';
    }
    SpinningCrystal.prototype = Object.create(Crystal.prototype);
    SpinningCrystal.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var theta = Number(drawingState.realtime)/200.0;
        if (this.axis == 'X') {
            twgl.m4.rotateX(modelM, theta, modelM);
        } else if (this.axis == 'Z') {
            twgl.m4.rotateZ(modelM, theta, modelM);
        } else {
            twgl.m4.rotateY(modelM, theta, modelM);
        }
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    SpinningCrystal.prototype.center = function(drawingState) {
        return this.position;
    }
    SpinningCrystal = function SpinningCrystal(name, position, size, color, axis) {
        Crystal.apply(this,arguments);
        this.axis = axis || 'X';
    }
    SpinningCrystal.prototype = Object.create(Crystal.prototype);
    SpinningCrystal.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var theta = Number(drawingState.realtime)/600.0;
        if (this.axis == 'X') {
            twgl.m4.rotateX(modelM, theta, modelM);
        } else if (this.axis == 'Z') {
            twgl.m4.rotateZ(modelM, theta, modelM);
        } else {
            twgl.m4.rotateY(modelM, theta, modelM);
        }
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        
        if (!drawingState.drawShadow)
			twgl.setUniforms(shaderProgram, { view:drawingState.view, proj:drawingState.proj, 
				depthMap: drawingState.depthMap, drawShadow: 0});
		else	
			twgl.setUniforms(shaderProgram, { view: drawingState.lightView, proj: drawingState.lightProj, 
				depthMap: drawingState.emptyBuff, drawShadow: 1});
		twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, lightView: drawingState.lightView, 
			lightProj: drawingState.lightProj});
			

        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    SpinningCrystal.prototype.center = function(drawingState) {
        return this.position;
    }



})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
//grobjects.push(new Cube("cube1",[0,0.5,   4],1,[0,1,1]) );

grobjects.push(new SpinningCrystal("cube1",[-2,0.5,   4],1,[0,1,0],'Y') );
// grobjects.push(new SpinningCrystal("cube1",[1,0.5,   6],1,[0,1,0],'Y') );
