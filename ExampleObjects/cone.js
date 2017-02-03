var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Cone = undefined;
var SpinningCone = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {

    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cones
    Cone = function Cone(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.8,.8,.8];
    }
    Cone.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all Cones
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!buffers) {
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,cloudGate);
        }

    };
    Cone.prototype.draw = function(drawingState) {
        // we make a model matrix to place the Cone in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var t = (Number(drawingState.realtime)%10000.0)/2000;
        var modelR = twgl.m4.lookAt([0,0,0],curveTangent(t),[0,1,1]);
        this.position = curveValue(t);
        modelM = twgl.m4.rotateY(modelM, Math.PI, modelM);
        modelM = twgl.m4.multiply(modelM, modelR);
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
    Cone.prototype.center = function(drawingState) {
        return this.position;
    }

    function curveValue(t){
      var p0=[5,0,0];
      var p1=[5,5,0];
      var p2=[5,8,0];
      var p3=[0,8,0];
      switch (Math.floor(t)){
        case 0:
          p0=[5,0,0];
          p1=[5,5,0];
          p2=[0,8,-10];
          p3=[0,8,0];
          break;
        case 1:
          p0=[0,8,0];
          p1=[0,8,5];
          p2=[-5,5,0];
          p3=[-5,0,0];
          t = t-1;
          break;
        case 2:
          p0=[-5,0,0];
          p1=[-5,-5,0];
          p2=[-10,-5,0];
          p3=[-10,0,0];
          t = t-2;
          break;
        case 3:
          p0=[-10,0,0];
          p1=[-10,5,0];
          p2=[-5,0,8];
          p3=[0,0,8];
          t = t-3;
          break;
        case 4:
          p0=[0,0,8];
          p1=[5,0,8];
          p2=[5,-5,0];
          p3=[5,0,0];
          t = t-4;
          break;
      }

      var b0=(1-t)*(1-t)*(1-t);
      var b1=3*t*(1-t)*(1-t);
      var b2=3*t*t*(1-t);
      var b3=t*t*t;
      
      
      var result = [p0[0]*b0+p1[0]*b1+p2[0]*b2+p3[0]*b3,
                    p0[1]*b0+p1[1]*b1+p2[1]*b2+p3[1]*b3,
                    p0[2]*b0+p1[2]*b1+p2[2]*b2+p3[2]*b3];
      return result;
    }

    function curveTangent(t){

      var p0=[5,0,0];
      var p1=[5,5,0];
      var p2=[5,8,0];
      var p3=[0,8,0];
      switch (Math.floor(t)){
        case 0:
          p0=[5,0,0];
          p1=[5,5,0];
          p2=[0,8,-10];
          p3=[0,8,0];
          break;
        case 1:
          p0=[0,8,0];
          p1=[0,8,5];
          p2=[-5,5,0];
          p3=[-5,0,0];
          t = t-1;
          break;
        case 2:
          p0=[-5,0,0];
          p1=[-5,-5,0];
          p2=[-10,-5,0];
          p3=[-10,0,0];
          t = t-2;
          break;
        case 3:
          p0=[-10,0,0];
          p1=[-10,5,0];
          p2=[-5,0,8];
          p3=[0,0,8];
          t = t-3;
          break;
        case 4:
          p0=[0,0,8];
          p1=[5,0,8];
          p2=[5,-5,0];
          p3=[5,0,0];
          t = t-4;
          break;
      }

      var b0=-3*(1-t)*(1-t);
      var b1=3*(1-3*t)*(1-t);
      var b2=3*t*(2-3*t);
      var b3=3*t*t;
      
      var result = [p0[0]*b0+p1[0]*b1+p2[0]*b2+p3[0]*b3,
                    p0[1]*b0+p1[1]*b1+p2[1]*b2+p3[1]*b3,
                    p0[2]*b0+p1[2]*b1+p2[2]*b2+p3[2]*b3];
      
      return result;
    }

    ////////
    // constructor for Cones
    SpinningCone = function SpinningCone(name, position, size, color, axis) {
        Cone.apply(this,arguments);
        this.axis = axis || 'X';
    }
    SpinningCone.prototype = Object.create(Cone.prototype);
    SpinningCone.prototype.draw = function(drawingState) {
        // we make a model matrix to place the Cone in the world
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
            Conecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    SpinningCone.prototype.center = function(drawingState) {
        return this.position;
    }


})();

grobjects.push(new Cone("Cone1",[5,0,0],0.5) );

