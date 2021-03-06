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
//var t;
// allow the two constructors to be "leaked" out
var Cube = undefined;
var SpinningCube = undefined;
function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
}
// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Cube = function Cube(tall,name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = tall|| 1.0;
        this.color = color || [.7,.8,.9];
        this.t = tall||2.0;
    }
    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        var t = Cube.tall;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                   -.5,-.5,-.5,  .5,-.5,-.5,  .5, this.t,-.5,        -.5,-.5,-.5,  .5, this.t,-.5, -.5, this.t,-.5,    // z = 0
                    -.5,-.5, .5,  .5,-.5, .5,  .5, this.t, .5,        -.5,-.5, .5,  .5, this.t, .5, -.5, this.t, .5,    // z = 1
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,               -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
                    -.5, this.t,-.5,  .5, this.t,-.5,  .5, this.t, .5,    -.5, this.t,-.5,  .5, this.t, .5, -.5, this.t, .5,     // y = 1
                    -.5,-.5,-.5, -.5, this.t,-.5, -.5, this.t, .5,        -.5,-.5,-.5, -.5, this.t, .5, -.5,-.5, .5,    // x = 0
                     .5,-.5,-.5,  .5, this.t,-.5,  .5, this.t, .5,         .5,-.5,-.5,  .5, this.t, 0.5,  .5,-.5, .5     // x = 1
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Cube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size*0.2,2,this.size*0.2]);
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
    Cube.prototype.center = function(drawingState) {
        return this.position;
    }

})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
//Pillar of Ads

grobjects.push(new Cube(1,"b8",[ -5.3,0.7,   4.2],1,[1,0,0]));
grobjects.push(new Cube(1,"b8",[ -3.7,0.7,   3.1],1,[1,0,0]));
grobjects.push(new Cube(1,"b8",[2.6,0.7,5],10,[0.92,0.34,0.16]));