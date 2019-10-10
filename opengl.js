
function init() {
    console.log("It's all good");
    let canvas = document.querySelector("#openglCanvas");
    let squareRotation = 0.0;

    if(canvas){
        let gl = canvas.getContext("webgl");

        if (gl === null){
            console.error("Couldn't get opengl context");
            return;
        }

        gl.clearColor(0.0,1.0,0.0,1.0);

        gl.clear(gl.COLOR_BUFFER_BIT);


        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;


            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying lowp vec4 vColor;

            void main(){
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;

        const fsSource = `
            varying lowp vec4 vColor;
            void main(){
                gl_FragColor = vColor;
            }
        `;


        const shaderProgram = initShaders(gl, vsSource, fsSource);

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        }

        const buffers = initBuffers(gl);
        function render() {
            squareRotation += 0.01;
            drawScene(gl, programInfo, buffers, squareRotation);
            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }
}

function initShaders(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    return(shader);
}

function initBuffers(gl) {
    const colorBuffer = gl.createBuffer();
    const positionBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    
    const positions = [
        //Front
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        //Back
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        //Top
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        //Bottom
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        //Right
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        //Left
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    const faceColors = [
        [1.0, 1.0, 1.0, 1.0], //White
        [1.0, 0.0, 0.0, 1.0], //Red
        [0.0, 1.0, 0.0, 1.0], //Green
        [0.0, 0.0, 1.0, 1.0], //Blue
        [1.0, 1.0, 0.0, 1.0], //Yellow
        [1.0, 0.0, 1.0, 1.0], //Purple
    ];

    const indices = [
         0,  1,  2,      0,  2,  3, //front
         4,  5,  6,      4,  6,  7, //back
         8,  9, 10,      8, 10, 11, //top
        12, 13, 14,     12, 14, 15, //bottom
        16, 17, 18,     16, 18, 19, //right
        20, 21, 22,     20, 22, 23, //left
    ];

    let colors = [];
    for (let i = 0; i < faceColors.length; ++i) {
        const c = faceColors[i];

        colors = colors.concat(c, c, c, c)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER, 
        new Float32Array(positions),
        gl.STATIC_DRAW);


    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
    );

    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
    };
}

function drawScene(gl, programInfo, buffers, squareRotation) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(
        projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar
    );

    const modelViewMatrix = mat4.create();

    mat4.translate(
        modelViewMatrix,
        modelViewMatrix,
        [-0.0, 0.0, -6.0]
    );

    mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        squareRotation * 7,
        [1, 0,0]
    );
    mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        squareRotation * 5,
        [0,1,0]
    );

    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );

        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );

        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );
    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
