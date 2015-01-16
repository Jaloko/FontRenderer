function FontRenderer(canvas) {
    this.gl,
    this.canvas = canvas,
    this.mvMatrix = mat4.create(),
    this.pMatrix = mat4.create(),
    this.currentProgram,
    this.shaderProgram,
    this.fontContext,
    this.texture,
    this.fontBuffer,
    this.textureFontBuffer,
    this.font = "Arial",
    this.fontSize = 16,
    this.textColour = {
        r: 0,
        g: 0,
        b: 0
    },
    this.initialized = false,
    this.init = function() {
        this.initGL();
        this.initShaders();
        this.initBuffers();
        this.prepareGL();
        this.initialized = true;
    },
    this.initGL = function() {
        try {
            this.gl = this.canvas.getContext("webgl");
            this.gl.viewportWidth = canvas.width;
            this.gl.viewportHeight = canvas.height;
            this.gl.viewportRatio = canvas.width / canvas.height;
        } catch(e) {
        }
        if (!this.gl) {
            alert("Could not initialise WebGL, sorry :-( ");
        }
    },
    this.initShaders = function() {
        var fragmentShader = this.getShaderFromVar(this.gl, fontFragShader, "Frag");
        var vertexShader = this.getShaderFromVar(this.gl, fontVertShader, "Vert");
        this.shaderProgram = this.createShader(this.shaderProgram, true, vertexShader, fragmentShader);
    },
    this.initBuffers = function() {
        this.fontBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fontBuffer);
        var verts = [
            1.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            1.0, 0.0, 0.0,
            0.0, 0.0, 0.0
        ];

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verts), this.gl.STATIC_DRAW);
        this.fontBuffer.itemSize = 3;
        this.fontBuffer.numItems = 4;

        this.textureFontBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureFontBuffer);
        var textureCoords = [
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0, 
            0.0, 0.0,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords), this.gl.STATIC_DRAW);
        this.textureFontBuffer.itemSize = 2;
        this.textureFontBuffer.numItems = 4;
    },
    this.prepareGL = function() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        mat4.ortho(this.pMatrix, -this.gl.viewportRatio, this.gl.viewportRatio, -1.0, 1.0, 0.1, 100.0);
        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix, this.mvMatrix, [-this.gl.viewportRatio , -1.0 , -1.0]);
        this.setCurrentShaderProgram(this.shaderProgram);
    },
    this.setMatrixUniforms = function(shaderProgram) {
        this.gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, this.pMatrix);
        this.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, this.mvMatrix);
    },
    this.clearCanvas = function() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    this.setColour = function(r, g, b) {
        this.textColour = {
            r: r,
            g: g,
            b: b
        }
    },
    this.setFont = function(font) {
        this.font = font;
    },
    this.setFontSize = function(fontSize) {
        this.fontSize = fontSize;
    }
    this.drawString = function(string, x, y, width, height) {
        this.setCurrentShaderProgram(this.shaderProgram);
        this.texture = this.createTextTexture(string, width, height);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        this.gl.enable(this.gl.BLEND);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fontBuffer);
        this.gl.vertexAttribPointer(this.currentProgram.vertexPositionAttribute, this.fontBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureFontBuffer);
        this.gl.vertexAttribPointer(this.currentProgram.textureCoordAttribute, this.textureFontBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.currentProgram.samplerUniform, 0);
        var actualY = this.gl.viewportHeight - y;
        mat4.translate(this.mvMatrix, this.mvMatrix, [this.convertToMatrix(x, true), this.convertToMatrix(actualY, false), 0.0]);
        this.setMatrixUniforms(this.currentProgram);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.fontBuffer.numItems);
        mat4.translate(this.mvMatrix, this.mvMatrix, [-this.convertToMatrix(x, true), -this.convertToMatrix(actualY, false), 0.0]);
    },
    this.setCurrentShaderProgram = function(shaderProgram) {
        this.gl.useProgram(shaderProgram);
        this.currentProgram = shaderProgram;
    },
    this.convertToMatrix = function(value, isWidth) {
        if(isWidth == true) {
            return (value / this.gl.viewportWidth * this.gl.viewportRatio * 2);
        } else {
            return (value / this.gl.viewportHeight * 2);
        }
    },
    this.convertVertToMatrix = function(x, y) {
        return verts = { x: x / this.gl.viewportWidth * this.gl.viewportRatio * 2, y: y / this.gl.viewportHeight * 2 };
    },
    this.getShaderFromHTML = function(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
        if (k.nodeType == 3)
            str += k.textContent;
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        } else {
            return null;
        }
        this.gl.shaderSource(shader, str);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(this.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    },
    this.getShaderFromVar = function(gl, shaderSrc, type) {
        var shader;
        if(type == "Vert" || type == "Vertex" || type == "VertexShader") {
            shader = this.gl.createShader(gl.VERTEX_SHADER);  
        } else if(type == "Frag" || type == "Fragment" || type == "FragmentShader") {
            shader = this.gl.createShader(gl.FRAGMENT_SHADER); 
        } else {
            console.log("Error: Cannot get shader. Invalid type provided.");
            return;
        }
        this.gl.shaderSource(shader, shaderSrc);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(this.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },
    this.createShader = function(shaderProgram, isTextureShader, vertexShader, fragmentShader) {
        shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert("Could not initialise shader: " + shaderProgram);
        }
        this.gl.useProgram(shaderProgram);
        if(isTextureShader == true) {
            this.enableTextureShaderAttribs(shaderProgram);  
        } else {
            this.enableRegularShaderAttribs(shaderProgram);  
        }
        shaderProgram.pMatrixUniform = this.gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(shaderProgram, "uMVMatrix");

        return shaderProgram;
    },
    this.enableTextureShaderAttribs = function(shaderProgram) {
        shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(shaderProgram, "aTextureCoord");
        this.gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    },
    this.createTextTexture = function(str, width, height) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fontBuffer);
        var verts = [
            width / this.gl.viewportWidth * this.gl.viewportRatio * 2, height / this.gl.viewportHeight * 2, 0.0,
            0.0, height / this.gl.viewportHeight * 2, 0.0,
            width / this.gl.viewportWidth * this.gl.viewportRatio * 2, 0.0, 0.0,
            0.0, 0.0, 0.0
        ];

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verts), this.gl.STATIC_DRAW);

        if (!this.fontContext) {
           this.fontContext = document.createElement("canvas").getContext("2d");
        }
        var ctx = this.fontContext;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        ctx.fillStyle = "rgb(" + this.textColour.r + "," + this.textColour.g +"," + this.textColour.b +")"; 

        ctx.font = this.fontSize + "px " + this.font;

        ctx.fillText(str, 0, this.fontSize);
        var tex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, ctx.canvas);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        
        return tex;
    },
    this.updateViewport = function() {
        mat4.ortho(this.pMatrix, -this.gl.viewportRatio, this.gl.viewportRatio, -1.0, 1.0, 0.1, 100.0);
        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix, this.mvMatrix, [-this.gl.viewportRatio , -1.0 , -1.0]);
    }
}