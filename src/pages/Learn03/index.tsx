import { useEffect, useRef } from 'react';
import { mat4 } from 'gl-matrix';

const Learn03 = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const squareRotation = useRef(0);
  const then = useRef(0);
  // 初始化着色器程序，让 WebGL 知道如何绘制我们的数据
  function initShaderProgram(
    gl: WebGLRenderingContext,
    vsSource: string,
    fsSource: string
  ): WebGLProgram | null {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // 创建着色器程序
    const shaderProgram = gl.createProgram();
    if (!shaderProgram || !vertexShader || !fragmentShader) return null;

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('错误' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  function loadShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (shader) {
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('错误' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }
    return null;
  }

  function initBuffers(gl: WebGLRenderingContext) {
    const positionBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
      1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      -1.0, -1.0,
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    const colors = [
      1.0, 1.0, 1.0, 1.0, // 白
      1.0, 0.0, 0.0, 1.0, // 红
      0.0, 1.0, 0.0, 1.0, // 绿
      0.0, 0.0, 1.0, 1.0, // 蓝
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
      color: colorBuffer,
    };
  }

  function drawScene(
    gl: WebGLRenderingContext,
    programInfo: any,
    buffers: any,
    deltaTime: number,
  ) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

    mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation.current, [0, 0, 1]);
    {
      const numComponents = 2;
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
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }

    squareRotation.current += deltaTime;
  }

  

  useEffect(() => {
    if (canvas.current) {
      // 初始化 WebGL 上下文，相当于我们绘画时的画板已准备好，纸张也平铺好了，就等着开始画图形了
      const gl = canvas.current.getContext('webgl');
      if (!gl) return;

      // 定义一个顶点着色器
      const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
    
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying lowp vec4 vColor;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vColor = aVertexColor;
        }
      `;
      // 定义片段着色器
      const fsSource = `
        varying lowp vec4 vColor;
        void main() {
          gl_FragColor = vColor;
        }
      `;

      const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
      if (!shaderProgram) return;
      const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(
            shaderProgram,
            'aVertexPosition'
          ),
          vertexColor: gl.getAttribLocation(
            shaderProgram,
            'aVertexColor'
          ),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(
            shaderProgram,
            'uProjectionMatrix'
          ),
          modelViewMatrix: gl.getUniformLocation(
            shaderProgram,
            'uModelViewMatrix'
          ),
        },
      };

      const buffers = initBuffers(gl);
      
      const render = (now: number) => {
        now *= 0.001;
        const deltaTime = now - then.current;
        then.current = now;
        drawScene(gl, programInfo, buffers, deltaTime);
        requestAnimationFrame(render);
      }
      
      requestAnimationFrame(render);
    }
  }, [canvas]);
  return <canvas width={640} height={480} ref={canvas}></canvas>;
};

export default Learn03;
