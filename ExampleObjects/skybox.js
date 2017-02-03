var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Skybox = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;



    // constructor for Cubes
    Skybox = function Skybox(position, size, color) {
        this.name = 'Skybox';
        this.position = position || [0,0,0];
        this.size = size || 600;
        this.angle = Math.PI;
    }
    Skybox.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["skybox-vs", "skybox-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                   1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1,     //front
                   1, 1, 1,   1,-1, 1,  1,-1,-1,   1, 1,-1,    //right
                   1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,    //top
                  -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    //left
                  -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,    //bottom
                   1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1    //back
                ] },
                vTexCoord : {numComponents:2, data: [
                    0.5, 0.66,   0.25, 0.66,   0.25, 0.33,   0.5, 0.33,//front
                    0.75, 0.34,   0.75, 0.66,   0.5, 0.66,   0.5, 0.34,//right
                    0.499, 0,   0.499, 0.33,   0.25, 0.33,   0.25, 0,//top
                    0, 0.34,   0.25, 0.33,   0.25, 0.66,   0, 0.66,//left
                    0.26, 1,   0.49, 1,   0.49, 0.67,   0.25, 0.67, //bottom
                    0.75, 0.34,   1, 0.34,   1, 0.66,   0.75, 0.66 //back
                ]},
                indices : [0, 1, 2,   0, 2, 3,    // front
                           4, 5, 6,   4, 6, 7,    // right
                           8, 9,10,   8,10,11,    // top
                          12,13,14,  12,14,15,    // left
                          16,17,18,  16,18,19,    // bottom
                          20,21,22,  20,22,23 ]
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }
        shaderProgram.program.texSampler1 = gl.getUniformLocation(shaderProgram.program, "texSampler1");
        gl.uniform1i(shaderProgram.texSampler1, 0);

        var textureSky = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureSky);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        var imageSky = new Image();
         imageSky.crossOrigin = "anonymous";
         imageSky.src = "https://c2.staticflickr.com/1/432/30821280473_06edb4a202.jpg"  ;
         window.setTimeout( imageSky.onload,200);
        imageSky.onload = function LoadTexture(){
              gl.activeTexture(gl.TEXTURE0);
              gl.bindTexture(gl.TEXTURE_2D, textureSky);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageSky);

              // Option 1 : Use mipmap, select interpolation mode
              //gl.generateMipmap(gl.TEXTURE_2D);
              //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

              // Option 2: At least use linear filters
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

              // Optional ... if your shader & texture coordinates go outside the [0,1] range
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }    
       
    };
    Skybox.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world

        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        modelM = twgl.m4.multiply(twgl.m4.rotationY(this.angle),modelM);
        twgl.m4.setTranslation(modelM, [0,50,0], modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Skybox.prototype.center = function(drawingState) {
        return this.position;
    }

})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
grobjects.push(new Skybox());
