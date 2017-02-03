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
var Cube = undefined;
var SpinningCube = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Cube = function Cube(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
    }
    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["building-vs", "building-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5, 3,-.5,        -.5,-.5,-.5,  .5, 3,-.5, -.5, 3,-.5,    // z = 0
                    -.5,-.5, .5,  .5,-.5, .5,  .5, 3, .5,        -.5,-.5, .5,  .5, 3, .5, -.5, 3, .5,    // z = 1
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,        -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
                    -.5, 3,-.5,  .5, 3,-.5,  .5, 3, .5,        -.5, 3,-.5,  .5, 3, .5, -.5, 3, .5,     // y = 1
                    -.5,-.5,-.5, -.5, 3,-.5, -.5, 3, .5,        -.5,-.5,-.5, -.5, 3, .5, -.5,-.5, .5,    // x = 0
                     .5,-.5,-.5,  .5, 3,-.5,  .5, 3, .5,         .5,-.5,-.5,  .5, 3, 0.5,  .5,-.5, .5     // x = 1
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,

                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                ]},
                vTex: {
                    numComponents: 2,
                    data: [
                        0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1,//z = 0
                        0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1,//z = 1
                        0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1,//y = 0
                        0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1,//y= 1
                        1, 1, 1, 0, 0, 0,   0, 1 ,1, 0, 1, 1,//x = 0
                        1, 1, 1, 0, 0, 0,   0, 1 ,1, 0, 1, 1
                        ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
            var textureRoofBuilding = gl.createTexture();
            gl.activeTexture(gl.TEXTURE6);        
            gl.bindTexture(gl.TEXTURE_2D, textureRoofBuilding);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            var imageRoofBuilding = new Image();
             imageRoofBuilding.crossOrigin = "anonymous";
            
             imageRoofBuilding.src= "https://c5.staticflickr.com/1/538/31651384796_034fe2c38b.jpg"   ;
             window.setTimeout(imageRoofBuilding.onload,200);
             imageRoofBuilding.onload = function () {
                gl.activeTexture(gl.TEXTURE6);
                gl.bindTexture(gl.TEXTURE_2D, textureRoofBuilding);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageRoofBuilding);
                // gl.generateMipmap(gl.TEXTURE_2D);
                   gl.generateMipmap(gl.TEXTURE_2D);
                 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                //  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
               
            }

        }

    };
    Cube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size*1.6,this.size*0.3,this.size*1]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
            shaderProgram.program.texSampler3 = gl.getUniformLocation(shaderProgram.program, "texSampler3");
        gl.uniform1i(shaderProgram.program.texSampler3, 6);

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
grobjects.push(new Cube("cube1",[5,0.15,  3],1,[3,2,1]) );
grobjects.push(new Cube("cube1",[5,0.15,  5],1,[3,2,2]) );
grobjects.push(new Cube("cube1",[5,0.15,  1],1,[3,2,1]) );
grobjects.push(new Cube("cube1",[5,0.15  -1],1,[3,2,2]) );
grobjects.push(new Cube("cube1",[5,0.15,  -3],1,[3,2,1]) );
grobjects.push(new Cube("cube1",[7,0.15,  3],1,[3,2,2]) );
grobjects.push(new Cube("cube1",[7,0.15,  5],1,[3,2,2]) );
grobjects.push(new Cube("cube1",[7,0.15,  1],1,[3,2,1]) );
grobjects.push(new Cube("cube1",[7,0.15,  -1],1,[3,2,2]) );
grobjects.push(new Cube("cube1",[7,0.15,  -3],1,[3,2,2]) );
