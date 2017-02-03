/**
 * Created by gleicher on 10/9/2015.
 */

/**
 the simplest possible object for the system

 look at this example first.
 be sure to read grobject.js to understand what this object is an "instance of"
 (even though there is no class definition)

 this object does the absolute minimum set of things.
 also, it defines everything itself - there is not prototype that we
 make lots of copies of.

 it will draw a pyramid at the origin. it's pretty useless - since it's in this fixed
 location
 but it's a start

 i am doing this without twgl - even though it makes my code kindof big.
 but it should be easier to see the GL calls
 the GL stuff is very much based on the "two transformed colored triangles" example from
 class (see the JSBin)
 **/

// this defines the global list of objects
    // if it exists already, this is a redundant definition
    // if it isn't create a new array
var grobjects = grobjects || [];

// now, I make a function that adds an object to that list
// there's a funky thing here where I have to not only define the function, but also
// run it - so it has to be put in parenthesis
(function() {
    "use strict";
   
    // I am keeping the shader code here so it doesn't "leak" out - it's ugly, but it will
    // keep this example simple. i do not recommend this for future objects
    var vertexSource = ""+
        "precision highp float;" +
        "attribute vec3 pos;" +
        "attribute vec3 inColor;" +
        "varying vec3 outColor;" +
        "uniform mat4 view;" +
        "uniform mat4 proj;" +
        "void main(void) {" +
        "  gl_Position = proj * view * vec4(pos, 1.0);" +
        "  outColor = inColor;" +
        "}";
    var fragmentSource = "" +
        "precision highp float;" +
        "varying vec3 outColor;" +
        "void main(void) {" +
        "  gl_FragColor = vec4(outColor, 1.0);" +
        "}";
    // putting the arrays of object info here as well
    var vertexPos = [
           0.5, 0,0.2,    -0.5,0,0.2,         0,-0.5,1.5,  //2
           0.5,-1,1,      3,-0.5,-2,          -3,-0.5,-2,  //5
           0,-0.5,-0.2,   0,-0.3,-3.5,        0,0.5,1,  //8
           1,-0.3,-3.5,   -1, -0.3,-3.5,      0,-0.3,-3,  //11
           -1,1,1,        -0.3,-0.3,-3.5,     -1,-1,-1,  //14
           -1,-1,1,       -0.5, -1,-3,        0.5,-1,-3,  //17 
           0.5,-1,1,      -0.5, -1, 1,        1,-1,-1,  //20
           0, 0.3,-3.7,   -1.5, -0.7, -3.5,   0.5,1,-1, //23
           -0.5,-1,1
    ];
    // make each triangle be a slightly different color - but each triangle is a solid color
    var vertexColors = [
           0, 0, 1,   0, 0, 1,   0, 1, 1,   //2
           0, 0, 1,   0, 1, 1,   0, 1, 1,   //5
           0, 0, 1,   1, 1, 0,   0, 1, 0,   //8
           0, 1, 1,   0, 1, 1,   1, 1, 0,   //11
           1, 1, 0,   1, 1, 0,   1, 1, 0,   //14
           1, 1, 0,   0, 1, 1,   0, 1, 1,   //17
           0, 0, 1,   0, 0, 1,   0, 1, 1,   //20
           0, 1, 1,   0, 1, 1,   0, 1, 1,   //23
           0, 0, 1,
    ];
    var triangleIndices =[ 
           0, 1, 2,     0, 2, 3,   // front
           1, 2, 24,    2, 24, 3,
           0, 3, 17,    0, 17, 7,  // right
           0, 1, 7,                // top
           1, 24,16,    1,16,7,    // left
           16,17,18,    16,18,19,  // bottom
	       16,17,7,                // back
           4, 5, 6,                //mainWings
           9, 10,11,               //Smallwings
           11, 7,21                //topWing
    ]; 
    // define the pyramid object
    // note that we cannot do any of the initialization that requires a GL context here
    // we define the essential methods of the object - and then wait
    //
    // another stylistic choice: I have chosen to make many of my "private" variables
    // fields of this object, rather than local variables in this scope (so they
    // are easily available by closure).
    var pyramid = {
        // first I will give this the required object stuff for it's interface
        // note that the init and draw functions can refer to the fields I define
        // below
        name : "plane",
        // the two workhorse functions - init and draw
        // init will be called when there is a GL context
        // this code gets really bulky since I am doing it all in place
        init : function(drawingState) {
            // an abbreviation...
            var gl = drawingState.gl;

            // compile the vertex shader
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader,vertexSource);
            gl.compileShader(vertexShader);
              if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                      alert(gl.getShaderInfoLog(vertexShader));
                      return null;
                  }
            // now compile the fragment shader
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader,fragmentSource);
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                  alert(gl.getShaderInfoLog(fragmentShader));
                  return null;
            }

            // OK, we have a pair of shaders, we need to put them together
            // into a "shader program" object
            // notice that I am assuming that I can use "this"
            this.shaderProgram = gl.createProgram();
            gl.attachShader(this.shaderProgram, vertexShader);
            gl.attachShader(this.shaderProgram, fragmentShader);
            gl.linkProgram(this.shaderProgram);
            if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
                alert("Could not initialize shaders");
            }
            // get the locations for each of the shader's variables
            // attributes and uniforms
            // notice we don't do much with them yet
            this.posLoc = gl.getAttribLocation(this.shaderProgram, "pos");
            this.colorLoc = gl.getAttribLocation(this.shaderProgram, "inColor");
            this.projLoc = gl.getUniformLocation(this.shaderProgram,"proj");
            this.viewLoc = gl.getUniformLocation(this.shaderProgram,"view");

            // now to make the buffers for the 4 triangles
            this.posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);
            this.posBuffer.itemSize = 3;


            this.colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
            this.colorBuffer.itemSize = 3;

            this.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(triangleIndices), gl.STATIC_DRAW);  

        },
        draw : function(drawingState) {
            var gl = drawingState.gl;
            var newview = drawingState.view;
            var newporj = drawingState.proj;
            var newcam = drawingState.camera;
            // twgl.m4.setTranslation(newcam,[0,3,0],newcam);
            newview = twgl.m4.inverse(newcam);
            twgl.m4.setTranslation(newview,[1,0,0],newview);
            //twgl.m4.setTranslation(newporj,[1,0,0],newporj);
            // choose the shader program we have compiled
            gl.useProgram(this.shaderProgram);
            // enable the attributes we had set up
            gl.enableVertexAttribArray(this.posLoc);
            gl.enableVertexAttribArray(this.colorLoc);
            // set the uniformsi
            gl.uniformMatrix4fv(this.viewLoc,false,newview);
            gl.uniformMatrix4fv(this.projLoc,false,newporj);

            // connect the attributes to the buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(this.colorLoc, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.vertexAttribPointer(this.posLoc, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	        // Do the drawing
            gl.drawElements(gl.TRIANGLES, 45, gl.UNSIGNED_BYTE, 0);


           // gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
            //gl.drawArrays(gl.TRIANGLES, 0, 12);
        },
        center : function(drawingState) {
            return [0,.5,0];
        },

        // these are the internal methods / fields of this specific object
        // we want to keep the shaders and buffers - rather than rebuild them
        // every draw. we can't initialize them now, but rather we need to wait
        // until there is a GL context (when we call init)
        // technically, these don't need to be defined here - init can just
        // add fields to the object - but I am putting them here  since it feels
        // more like a normal "class" declaration
        shaderProgram : undefined,
        posBuffer : undefined,
        colorBuffer : undefined,
        indexBuffer : undefined,
        posLoc : -1,
        colorLoc : -1,
        projLoc : -1,
        viewLoc : -1
    };

    // now that we've defined the object, add it to the global objects list
    grobjects.push(pyramid);
})();