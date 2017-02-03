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
        this.size = size || 2.0;
        this.color = color || [0,1,0.7];
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
                    -.5,-.5,-.5,  .5,-.5,-.5,  0, 5,-.72,        -.5,-.5,-.5,  0, 5,-.72, -.72, 5, 0,    // z = 0
                    -.5,-.5, .5,  .5,-.5, .5,  .72, 5, 0,        -.5,-.5, .5,  .72, 5, 0,  0, 5, .72,    // z = 1
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,        -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
                    -.72, 5,  0,  0, 5,-.72,   .72, 5, 0,        -.72, 5,  0,  .72, 5,  0,  0, 5, .72,     // y = 1
                   // .05,5,.05,  0,6,0,  -.05, 5,-.05,            -.05,5,.05,  0,6,0,  .05, 5,-.05,      //needle
                    -.5,-.5,-.5, -.72, 5, 0,  0, 5, .72,        -.5,-.5,-.5,  0, 5, .72, -.5,-.5, .5,    // x = 0
                     .5,-.5,-.5,  0, 5,-.72,  .72, 5, 0,         .5,-.5,-.5,  .72, 5, 0,  .5,-.5, .5     // x = 1
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                  //  -1,-1,0, -1,-1,0, -1,-1,0,  1,-1,0, 1,-1,0, 1,-1,0,//top needle
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                ]},
                 vTex: {
                    numComponents: 2,
                    data: [
                        0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1,//z = 0
                        0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1,//z = 1
                        0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1,//y = 0
                        0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1,//y = 1
                        // 0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1,//needle
                        0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1,//x = 0
                        0, 0, 1, 0, 1, 1,   0, 0, 1, 1, 0, 1 //x = 1
                    ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

             var textureTri = gl.createTexture();
            gl.activeTexture(gl.TEXTURE11);  
            gl.bindTexture(gl.TEXTURE_2D, textureTri);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
            var imageTri = new Image();
            imageTri.crossOrigin = "anonymous";
            imageTri.src = "https://c4.staticflickr.com/1/529/30882175843_170e969de3.jpg"  ;
            window.setTimeout( imageTri.onload,200);
            imageTri.onload = function () {
                 
                gl.activeTexture(gl.TEXTURE11);  
                gl.bindTexture(gl.TEXTURE_2D, textureTri);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageTri);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
               
            }
        }

    };
    Cube.prototype.draw = function(drawingState) {
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
             shaderProgram.program.texSampler3 = gl.getUniformLocation(shaderProgram.program, "texSampler3");
        gl.uniform1i(shaderProgram.program.texSampler3, 11);

        if (drawingState.drawShadow)
			twgl.setUniforms(shaderProgram, { view: drawingState.lightView, proj: drawingState.lightProj, 
				depthMap: drawingState.emptyBuff, drawShadow: 1});
		else 
			twgl.setUniforms(shaderProgram, { view:drawingState.view, proj:drawingState.proj, 
				depthMap: drawingState.depthMap, drawShadow: 0});
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
grobjects.push(new Cube("cube1",[-2,0.5,   2],1,1[1,1,1] ));
grobjects.push(new Cube("cube1",[-4,0.5,   2],1,1[1,1,1] ));
grobjects.push(new Cube("cube1",[-4,0.5,   -4],1,1[1,1,1] ));
grobjects.push(new Cube("cube1",[-8,0.5,   4],1,1[1,1,1] ));
