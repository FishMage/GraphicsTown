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

     //creates a gl texture from an image object. Sometiems the image is upside down so flipY is passed to optionally flip the data.
    //it's mostly going to be a try it once, flip if you need to. 
    // var createGLTexture = function (gl, image, flipY) {
    //     var texture = gl.createTexture();
    //     gl.bindTexture(gl.TEXTURE_2D, texture);
    //     if(flipY){
    //         gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    //     }
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
    //     gl.generateMipmap(gl.TEXTURE_2D);
    //     gl.bindTexture(gl.TEXTURE_2D, null);
    //     return texture;
    // }



    // constructor for Cubes
    Cube = function Cube(name, position, size, color, rotation) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 0.3;
        this.color = color || [.7,.8,.9];
        this.texture = null;
        this.rotation = rotation||Math.PI;
    }
    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        //this.texture = createGLTexture(gl, image, true);
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["building-vs", "building-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1  //front
                ] },
                vnormal : {numComponents:3, data: [
                   
                    0,0,-1,     0,0,-1,    0,0,-1,    0,0,-1,    0,0,-1,    0,0,-1
                   
                ]},
                 vTex: {
                    numComponents: 2,
                    data: [
                        0,1, 1,1, 1,0, 0,0
                    ]},
                     indices : [0, 1, 2,   0, 2, 3]   // front]
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

            var textureTri = gl.createTexture();
            gl.activeTexture(gl.TEXTURE7);  
            gl.bindTexture(gl.TEXTURE_2D, textureTri);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
            }
            var imageTri = new Image();
            imageTri.crossOrigin = "anonymous";
            imageTri.src = "https://c3.staticflickr.com/1/243/30791602114_48336fcb42.jpg" ; 
            window.setTimeout( imageTri.onload,200);
            imageTri.onload = function () {
                 
                gl.activeTexture(gl.TEXTURE7);  
                gl.bindTexture(gl.TEXTURE_2D, textureTri);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageTri);
                   gl.generateMipmap(gl.TEXTURE_2D);
                 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
               
            }
        }
        

    };
    Cube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size*0.5,this.size*0.6,this.size]);
        modelM = twgl.m4.multiply(twgl.m4.rotationY(this.rotation),modelM);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,
        {
            view:drawingState.view,
            proj:drawingState.proj, 
            lightdir:drawingState.sunDirection,
            cubecolor:this.color,
             model: modelM 
            });
        shaderProgram.program.texSampler3 = gl.getUniformLocation(shaderProgram.program, "texSampler3");
        gl.uniform1i(shaderProgram.program.texSampler3, 7);

        
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);

    };
    Cube.prototype.center = function(drawingState) {
        return this.position;
    }


})();
grobjects.push(new Cube("b1",[2,2.5,-0.45],0.99,[1,1,1],Math.PI) );
