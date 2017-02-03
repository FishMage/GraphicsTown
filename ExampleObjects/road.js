
var grobjects = grobjects || [];

var Road = undefined;
// now, I make a function that adds an object to that list
// there's a funky thing here where I have to not only define the function, but also
// run it - so it has to be put in parenthesis
(function() {
    "use strict";

    // putting the arrays of object info here as well
    var vertexPos = [
        -1,0.1,-1,  -1,.1,1,  1,.1,-1,
        1,.1,-1,  1,.1,1, -1,0.1,1
    ];

    // since there will be one of these, just keep info in the closure
    var shaderProgram = undefined;
    var buffers = undefined;
    var num = 0;
    // define the pyramid object
    // note that we cannot do any of the initialization that requires a GL context here
    // we define the essential methods of the object - and then wait
    //
    // another stylistic choice: I have chosen to make many of my "private" variables
    // fields of this object, rather than local variables in this scope (so they
    // are easily available by closure).
    Road = function Road( scale, shift) {
        this.name = 'road'+num++;
        this.shift = shift || [0,0,0];
        this.scale = scale || [1,1,1];
    }

    Road.prototype.init = function(drawingState) {
            // an abbreviation...
            var gl = drawingState.gl;
            if (!shaderProgram) {
                shaderProgram = twgl.createProgramInfo(gl,["building-vs","building-fs"]);
            }
            var arrays = { vpos : {numComponents:3, data:vertexPos }};
            buffers = twgl.createBufferInfoFromArrays(gl,arrays);
    };
    Road.prototype.draw = function(drawingState) {
            var gl = drawingState.gl;
            gl.useProgram(shaderProgram.program);
            var modelM = twgl.m4.scaling(this.scale);
            twgl.m4.setTranslation(modelM, this.shift, modelM);
            twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
            twgl.setUniforms(shaderProgram,{
                view:drawingState.view, proj:drawingState.proj, color:[0.1,0.1,0.1], model: modelM
            });
             //Shadow
           if(drawingState.drawShadow)
				twgl.setUniforms(shaderProgram, { view: drawingState.lightView, proj: drawingState.lightProj, color:[1,1,1],
					depthMap: drawingState.emptyBuff, drawShadow: 1});
			else 
				twgl.setUniforms(shaderProgram, { view: drawingState.view, proj: drawingState.proj, color:[1,1,1],
					depthMap: drawingState.depthMap, drawShadow: 0});
			twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, lightView: drawingState.lightView, 
		    	lightProj: drawingState.lightProj});

            twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Road.prototype.center = function(drawingState) {
            return [0,0,0];
    };
    // now that we've defined the object, add it to the global objects list
})();
    // grobjects.push(new Road( [5,1,0.5],[-1,-0,5]));
    grobjects.push(new Road( [11,1.1,0.5],[-2,-0,-6]));
    grobjects.push(new Road( [.6,1.1,20],[3.3,-0,0]));
    grobjects.push(new Road( [.6,1.1,20],[9,-0,0]));
    grobjects.push(new Road( [.5,1.1,20],[-6,-0,0]));