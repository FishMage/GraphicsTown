var ref = undefined;

(function() {

    var shaderProgram = undefined;
    var buffers = undefined;


    ref = function ref(position, size, color) {
        this.name = 'ref';
        this.position = position || [0,1.2,0];
        this.size = size || 1.3;
    };
    ref.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["ref-vs", "ref-fs"]);
        }
        if (!buffers) 
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,cloudGate);
        
        //shaderProgram.skybox = gl.getUniformLocation(shaderProgram, "skybox");
        gl.uniform1i(shaderProgram.skybox, 0);
    };
    ref.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size*0.5,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        drawingState.inverseViewTransform = twgl.m4.inverse(twgl.m4.multiply(modelM, drawingState.view));
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            model: modelM, inverseViewTransform: drawingState.inverseViewTransform});
        // if (!drawingState.drawShadow)
		// 	twgl.setUniforms(shaderProgram, { view:drawingState.view, proj:drawingState.proj, 
		// 		depthMap: drawingState.depthMap, drawShadow: 0});
		// else	
		// 	twgl.setUniforms(shaderProgram, { view: drawingState.lightView, proj: drawingState.lightProj, 
		// 		depthMap: drawingState.emptyBuff, drawShadow: 1});
		// twgl.setUniforms(shaderProgram, {lightdir:drawingState.sunDirection, lightView: drawingState.lightView, 
		// 	lightProj: drawingState.lightProj});
			
        
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
})();

var ref= new ref();