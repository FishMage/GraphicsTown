/**
 * Created by gleicher on 10/17/15.
 */
var grobjects = grobjects || [];

// make the two constructors global variables so they can be used later
var Copter = undefined;
var Helipad = undefined;

/* this file defines a helicopter object and a helipad object

the helicopter is pretty ugly, and the rotor doesn't spin - but
it is intentionally simply. it's ugly so that students can make
it nicer!

it does give an example of index face sets

read a simpler object first.


the helipad is a simple object for the helicopter to land on.
there needs to be at least two helipads for the helicopter to work..


the behavior of the helicopter is at the end of the file. it is
an example of a more complex/richer behavior.
 */

(function () {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var copterBodyBuffers = undefined;
    var copterRotorBuffers = undefined;
    var copterNumber = 0;

    var padBuffers = undefined;
    var padNumber = 0;

    // constructor for Helicopter
    Copter = function Copter(name) {
        this.name = "copter"+copterNumber++;
        this.position = [6,1,6];    // will be set in init
        this.color = [.9,.3,.4];
        // about the Y axis - it's the facing direction
        this.orientation = 1;
    }
    Copter.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        var q = .25;  // abbreviation

        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!copterBodyBuffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    0.5, 0,0.2,    -0.5,0,0.2,         0,-0.5,1.5,  //2
                    0.5,-1,1,      3,-0.5,-2,          -3,-0.5,-2,  //5
                    0,-0.5,-0.2,   0,-0.3,-3.5,        0,0.5,1,  //8
                    1,-0.3,-3.5,   -1, -0.3,-3.5,      0,-0.3,-3,  //11
                    -1,1,1,        -0.3,-0.3,-3.5,     -1,-1,-1,  //14
                    -1,-1,1,       -0.5, -1,-3,        0.5,-1,-3,  //17 
                    0.5,-1,1,      -0.5, -1, 1,        1,-1,-1,  //20
                    0, 0.3,-3.7,   -1.5, -0.7, -3.5,   0.5,1,-1, //23
                    -0.5,-1,1
                ] },
                vnormal : {numComponents:3, data: [
                    0,1,1,  0,-1,1,  -1,0,-1,  
                    0,0,-1, 0,1,0,   0,-1,0,
                    1,0,0,  0,1,0,   -1,0,0, 
                    0,0,-1, 0,0,-1,  -1,0,-1,  
                    0,0,-1, 0,1,0,   0,-1,0,
                    1,0,0,  0,1,0,   -1,0,0, 
                    0,0,-1, 0,0,-1,  -1,0,-1,  
                    0,0,-1, 0,1,0,   0,-1,0,
                    0,-1,0
                ]},
                indices : [ 0, 1, 2,     0, 2, 3,   // front
                            1, 2, 24,    2, 24, 3,
                            0, 3, 17,    0, 17, 7,  // right
                            0, 1, 7,                // top
                            1, 24,16,    1,16,7,    // left
                            16,17,18,    16,18,19,  // bottom
	                        16,17,7,                // back
                            4, 5, 6,                //mainWings
                            9, 10,11,               //Smallwings
                            11, 7,21                //topWing
                            ]
            };
            copterBodyBuffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

            var rarrays = {
                vpos : {numcomponents:3, data: [0,.5,0, 1,.5,.1, 1,.5, -.1,
                                                0,.5,0, -1,.5,.1, -1,.5, -.1]},
                vnormal : {numcomponents:3, data: [0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0]},
                indices : [0,1,2, 3,4,5]
            };
            copterRotorBuffers = twgl.createBufferInfoFromArrays(drawingState.gl,rarrays);
        }
        // put the helicopter on a random helipad
        // see the stuff on helicopter behavior to understand the thing
        this.lastPad = randomHelipad();
        this.position = twgl.v3.add(this.lastPad.center(),[0,2+this.lastPad.helipadAltitude,0]);
        this.state = 0; // landed
        this.wait = getRandomInt(250,750);
        this.lastTime = 0;

    };
    Copter.prototype.draw = function(drawingState) {
        // make the helicopter fly around
        // this will change position and orientation
        advance(this,drawingState);

        // we make a model matrix to place the cube in the world
        
        var Mr= twgl.m4.rotationY(this.orientation);
        var modelM = twgl.m4.scaling([0.2,0.2,0.2]);
        modelM = twgl.m4.multiply(Mr,modelM);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.setBuffersAndAttributes(gl,shaderProgram,copterBodyBuffers);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, copterBodyBuffers);
        twgl.setBuffersAndAttributes(gl,shaderProgram,copterRotorBuffers);
        //twgl.drawBufferInfo(gl, gl.TRIANGLES, copterRotorBuffers);
    };
    Copter.prototype.center = function(drawingState) {
        return this.position;
    }


    // constructor for Helipad
    // note that anything that has a helipad and helipadAltitude key can be used
    Helipad = function Helipad(position) {
        this.name = "helipad"+padNumber++;
        this.position = position || [2,0.01,2];
        this.size = 1.0;
        // yes, there is probably a better way
        this.helipad = true;
        // what altitude should the helicopter be?
        // this get added to the helicopter size
        this.helipadAltitude = 0;
    }
    Helipad.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        var q = .25;  // abbreviation

        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!padBuffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    0.5, 0,0.2,    -0.5,0,0.2,         0,-0.5,1.5,  //2
                    0.5,-1,1,      3,-0.5,-2,          -3,-0.5,-2,  //5
                    0,-0.5,-0.2,   0,-0.3,-3.5,        0,0.5,1,  //8
                    1,-0.3,-3.5,   -1, -0.3,-3.5,      0,-0.3,-3,  //11
                    -1,1,1,        -0.3,-0.3,-3.5,     -1,-1,-1,  //14
                    -1,-1,1,       -0.5, -1,-3,        0.5,-1,-3,  //17 
                    0.5,-1,1,      -0.5, -1, 1,        1,-1,-1,  //20
                    0, 0.3,-3.7,   -1.5, -0.7, -3.5,   0.5,1,-1, //23
                    -0.5,-1,1

                ] },
                vnormal : {numComponents:3, data: [
                    0,1,0, 0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0, 0,1,0,
                    
                    
                ]},
                indices : [ 0, 1, 2,     0, 2, 3,   // front
                            1, 2, 24,    2, 24, 3,
                            0, 3, 17,    0, 17, 7,  // right
                            0, 1, 7,                // top
                            1, 24,16,    1,16,7,    // left
                            16,17,18,    16,18,19,  // bottom
                            16,17,7,                // back
                            4, 5, 6,                //mainWings
                            9, 10,11,               //Smallwings
                            11, 7,21                //topWing
                            ]
            };
            padBuffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Helipad.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([0.5,0.5,0.5]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:[1,1,0], model: modelM });
        twgl.setBuffersAndAttributes(gl,shaderProgram,padBuffers);
      //  twgl.drawBufferInfo(gl, gl.TRIANGLES, padBuffers);
    };
    Helipad.prototype.center = function(drawingState) {
        return this.position;
    }

    ///////////////////////////////////////////////////////////////////
    // Helicopter Behavior
    //
    // the guts of this (the "advance" function) probably could
    // have been a method of helicopter.
    //
    // this is all kept separate from the parts that draw the helicopter
    //
    // the idea is that
    // the helicopter starts on a helipad,
    // waits some random amount of time,
    // takes off (raises to altitude),
    // picks a random helipad to fly to,
    // turns towards that helipad,
    // flies to that helipad,
    // lands
    //
    // the helicopter can be in 1 of 4 states:
    //      landed  (0)
    //      taking off (1)
    //      turning towards dest (2)
    //      flying towards dest (3)
    //      landing (4)


    ////////////////////////
    // constants
    var altitude = 8;
    var verticalSpeed = 4 / 1000;      // units per milli-second
    var flyingSpeed = 2/1000;          // units per milli-second
    var turningSpeed = 1/1000;         // radians per milli-second
    var idx = 3;
    // utility - generate random  integer
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    // find a random helipad - allow for excluding one (so we don't re-use last target)
    function randomHelipad(exclude) {
        var helipads = grobjects.filter(function(obj) {return (obj.helipad && (obj!=exclude))});
        if (!helipads.length) {
            throw("No Helipads for the helicopter!");
        }
         idx = (idx+1)%3;
        return helipads[idx];
    }

    // this actually does the work
    function advance(heli, drawingState) {
        // on the first call, the copter does nothing
        if (!heli.lastTime) {
            heli.lastTime = drawingState.realtime;
            return;
        }
        var delta = drawingState.realtime - heli.lastTime;
        heli.lastTime = drawingState.realtime;

        // now do the right thing depending on state
        switch (heli.state) {
            case 0: // on the ground, waiting for take off
                if (heli.wait > 0) { heli.wait -= delta; }
                else {  // take off!
                    heli.state = 1;
                    heli.wait = 0;
                }
                break;
            case 1: // taking off
                if (heli.position[1] < altitude) {
                    var up = verticalSpeed * delta;
                    heli.position[1] = Math.min(altitude,heli.position[1]+up);
                } else { // we've reached altitude - pick a destination
                    var dest = randomHelipad(heli.lastPad);
                    heli.lastPad = dest;
                    // the direction to get there...
                    heli.dx = dest.position[0] - heli.position[0];
                    heli.dz = dest.position[2] - heli.position[2];
                    heli.dst = Math.sqrt(heli.dx*heli.dx + heli.dz*heli.dz);
                    if (heli.dst < .01) {
                        // small distance - just go there
                        heli.position[0] = dest.position[0];
                        heli.position[2] = dest.position[2];
                        heli.state = 4;
                     } else {
                        heli.vx = heli.dx / heli.dst;
                        heli.vz = heli.dz / heli.dst;
                    }
                    heli.dir = Math.atan2(heli.dx,heli.dz);
                    heli.state = 2;
                }
                break;
            case 2: // spin towards goal
                var dtheta = heli.dir - heli.orientation;
                // if we're close, pretend we're there
                if (Math.abs(dtheta) < .01) {
                    heli.state = 3;
                    heli.orientation = heli.dir;
                }
                var rotAmt = turningSpeed * delta;
                if (dtheta > 0) {
                    heli.orientation = Math.min(heli.dir,heli.orientation+rotAmt);
                } else {
                    heli.orientation = Math.max(heli.dir,heli.orientation-rotAmt);
                }
                break;
            case 3: // fly towards goal
                if (heli.dst > .01) {
                    var go = delta * flyingSpeed;
                    // don't go farther than goal
                    go = Math.min(heli.dst,go);
                    heli.position[0] += heli.vx * go;
                    heli.position[2] += heli.vz * go;
                    heli.dst -= go;
                } else { // we're effectively there, so go there
                    heli.position[0] = heli.lastPad.position[0];
                    heli.position[2] = heli.lastPad.position[2];
                    heli.state = 1;
                }
                break;
    
            //     break;
        }
    }
})();

// normally, I would put this into a "scene description" file, but having
// it here means if this file isn't loaded, then there are no dangling
// references to it

// make the objects and put them into the world
// note that the helipads float above the floor to avoid z-fighting
grobjects.push(new Copter());
grobjects.push(new Helipad([3,.01,3]));
grobjects.push(new Helipad([3,.01,-3]));
grobjects.push(new Helipad([-3,.01,-3]));
grobjects.push(new Helipad([-3,.01,3]));

// just to show - if there's a cube, we can land on it
var acube = findObj("cube1");
if (acube) {
    acube.helipad = true;
    acube.helipadAltitude = .5;
}
