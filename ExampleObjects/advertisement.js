var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var adv = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffersAdv = undefined;



    // constructor for Cubes
    adv = function adv(position, size, color) {
        this.name = 'Advertisement';
        this.position = position || [
            -5,1.5,3];
        this.size = size || 1;
        this.angle = Math.PI/5.5;
    }
    adv.prototype.init = function(drawingState) {
        var gl = drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["adv-vs", "adv-fs"]);
           // alert("get ADV shader!");
        }
        if (!buffersAdv) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                     1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1  //front
                ] },
                vTexCoord : {numComponents:2, data: [
                0,1, 1,1, 1,0, 0,0
                ]},
                indices : [0, 1, 2,   0, 2, 3]   // front]
            };
            buffersAdv = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

        var textureAdv = gl.createTexture();
            gl.activeTexture(gl.TEXTURE2);        
            gl.bindTexture(gl.TEXTURE_2D, textureAdv);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            var imageAdv = new Image();
             imageAdv.crossOrigin = "anonymous";
            imageAdv.src = "https://c3.staticflickr.com/1/495/31260756570_bbc3f5ef15.jpg" ;
             window.setTimeout( imageAdv.onload,200);
             imageAdv.onload = function () {
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, textureAdv);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageAdv);
                // gl.generateMipmap(gl.TEXTURE_2D);
                 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
               
            }
        
    };
    adv.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        modelM = twgl.m4.multiply(twgl.m4.rotationY(this.angle),modelM);
        twgl.m4.setTranslation(modelM, [-4,1.7,4.5], modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffersAdv);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            model: modelM });
        shaderProgram.program.texSamplerAd= gl.getUniformLocation(shaderProgram.program, "texSamplerAd");
        gl.uniform1i(shaderProgram.texSamplerAd, 2);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffersAdv);
    };
    adv.prototype.center = function(drawingState) {
        return this.position;
    }
// imageAdv.src = "https://c3.staticflickr.com/1/243/30791602114_48336fcb42.jpg" ;
})();
grobjects.push(new adv());
