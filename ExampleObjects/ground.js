/**
 * Created by gleicher on 10/9/2015.
 */

/**
 this is even simpler than the simplest object - it's a ground plane underneath
 the objects (at Z=0) - just a big plane. all coloring handled in the vertex
 shader. no normals. it's just a checkerboard that is simple.

 no normals, but a funky shader

 however, I am going to do it with TWGL to keep the code size down
 **/

// this defines the global list of objects
    // if it exists already, this is a redundant definition
    // if it isn't create a new array
var grobjects = grobjects || [];

// a global variable to set the ground plane size, so we can easily adjust it
// in the html file (before things run
// this is the +/- in the X and Z direction (so things will go from -5 to +5 by default)
var groundPlaneSize = groundPlaneSize || 20;

// now, I make a function that adds an object to that list
// there's a funky thing here where I have to not only define the function, but also
// run it - so it has to be put in parenthesis
(function() {
    "use strict";

    // putting the arrays of object info here as well
    var vertexPos = [
        -groundPlaneSize, 0, -groundPlaneSize,
         groundPlaneSize, 0, -groundPlaneSize,
         groundPlaneSize, 0,  10,
        -groundPlaneSize, 0, -groundPlaneSize,
         groundPlaneSize, 0, 10,
        -groundPlaneSize, 0, 10
    ];
    var vnormal = [
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                ];
    // since there will be one of these, just keep info in the closure
    var shaderProgram = undefined;
    var buffers = undefined;

    // define the pyramid object
    // note that we cannot do any of the initialization that requires a GL context here
    // we define the essential methods of the object - and then wait
    //
    // another stylistic choice: I have chosen to make many of my "private" variables
    // fields of this object, rather than local variables in this scope (so they
    // are easily available by closure).
    var ground = {
        // first I will give this the required object stuff for it's interface
        // note that the init and draw functions can refer to the fields I define
        // below
        name : "Ground Plane",
        // the two workhorse functions - init and draw
        // init will be called when there is a GL context
        // this code gets really bulky since I am doing it all in place
        init : function(drawingState) {
            // an abbreviation...
            var gl = drawingState.gl;
            if (!shaderProgram) {
                shaderProgram = twgl.createProgramInfo(gl,["ground-vs","ground-fs"]);
            }
            var arrays = { vpos : {numComponents:3, data:vertexPos }};
            buffers = twgl.createBufferInfoFromArrays(gl,arrays);

            // var textureTri = gl.createTexture();
            // gl.activeTexture(gl.TEXTURE16);  
            // gl.bindTexture(gl.TEXTURE_2D, textureTri);
            // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
            // var imageTri = new Image();
            // imageTri.crossOrigin = "anonymous";
            // imageTri.src = "https://c4.staticflickr.com/6/5559/31212460651_77eed01aa2.jpg" ;
            // window.setTimeout( imageTri.onload,200);
            // imageTri.onload = function () {
                 
            //     gl.activeTexture(gl.TEXTURE16);  
            //     gl.bindTexture(gl.TEXTURE_2D, textureTri);
            //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageTri);
            //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
               
            // }
       },
        draw : function(drawingState) {
            var gl = drawingState.gl;
            gl.useProgram(shaderProgram.program);
            twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
            // twgl.setUniforms(shaderProgram,{
            //     view:drawingState.view, proj:drawingState.proj, color:[.63,.67,.72], model:twgl.m4.identity()
            // });
            //  shaderProgram.program.texSampler3 = gl.getUniformLocation(shaderProgram.program, "texSampler3");
            //  gl.uniform1i(shaderProgram.program.texSampler3, 15);
             
            if (drawingState.drawShadow)
				twgl.setUniforms(shaderProgram, { view: drawingState.lightView, proj: drawingState.lightProj, color:[.63,.67,.72],
					depthMap: drawingState.emptyBuff, drawShadow: 1});
			else 
				twgl.setUniforms(shaderProgram, { view: drawingState.view, proj: drawingState.proj, color:[.63,.67,.72],
					depthMap: drawingState.depthMap, drawShadow: 0});
			twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, lightView: drawingState.lightView, 
		    	lightProj: drawingState.lightProj});
            twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
            
        },
        center : function(drawingState) {
            return [0,2,0];
        }

    };

    // now that we've defined the object, add it to the global objects list
    grobjects.push(ground);
})();