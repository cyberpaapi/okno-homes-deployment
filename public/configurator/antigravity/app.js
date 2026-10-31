(async function () {
const okno = await window.oknoSettings;

    const THREE = window.THREE;
    const OrbitControls = window.OrbitControls;
    const GLTFLoader = window.GLTFLoader;

    const container = document.getElementById('canvas-container');
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping || THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); window.parent.postMessage({type:'OKNO_CONFIGURATOR_ERROR'}, location.origin); });

    const scene = new THREE.Scene();
    // Soft natural outdoor botanical atmosphere mist (zero whiteout!)
    scene.fog = new THREE.FogExp2(0xCBE2CE, 0.0022);

    // =========================================================================
    // REAL-TIME OUTDOOR BOTANICAL & SUNLIGHT HDRI ENVIRONMENT MAP (PMREMGenerator)
    // Gives glass, metal, timber & stone authentic sky, sun & lush lawn bounce!
    // =========================================================================
    function buildStudioEnvironmentMap() {
      if (!THREE.PMREMGenerator) return;
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();

      const envScene = new THREE.Scene();
      const envSkyGeo = new THREE.SphereGeometry(60, 32, 16);
      const envSkyMat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          zenithColor:  { value: new THREE.Color(0x4F8FD0) },
          horizonColor: { value: new THREE.Color(0xE8F4EA) },
          groundColor:  { value: new THREE.Color(0x4A6E35) }
        },
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 zenithColor;
          uniform vec3 horizonColor;
          uniform vec3 groundColor;
          varying vec3 vPos;
          void main() {
            float h = normalize(vPos).y;
            vec3 col = h >= 0.0
              ? mix(horizonColor, zenithColor, pow(h, 0.52))
              : mix(horizonColor, groundColor, pow(-h, 0.42));
            vec3 sunDir = normalize(vec3(0.55, 0.48, 0.68));
            float sunAmt = max(dot(normalize(vPos), sunDir), 0.0);
            col += vec3(1.0, 0.95, 0.84) * pow(sunAmt, 48.0) * 7.0;
            gl_FragColor = vec4(col, 1.0);
          }
        `
      });
      envScene.add(new THREE.Mesh(envSkyGeo, envSkyMat));

      const envRT = pmrem.fromScene(envScene, 0.02);
      scene.environment = envRT.texture;
      pmrem.dispose();
    }
    buildStudioEnvironmentMap();

    // Natural Sunlit Tropical Sky Dome with Soft Procedural Cumulus Clouds
    const skyGeo = new THREE.SphereGeometry(240, 48, 32);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor:     { value: new THREE.Color(0x2F6FB5) },
        midColor:     { value: new THREE.Color(0x78B4E6) },
        horizonColor: { value: new THREE.Color(0xD8EEDB) },
        bottomColor:  { value: new THREE.Color(0x3E642C) }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 horizonColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPos;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p *= 2.05;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec3 dir = normalize(vWorldPos);
          float h = dir.y;
          vec3 col;
          if (h >= 0.0) {
            vec3 baseSky = mix(horizonColor, midColor, smoothstep(0.0, 0.28, h));
            col = mix(baseSky, topColor, smoothstep(0.22, 0.88, h));
            // Soft sunlit cumulus clouds in upper hemisphere
            if (h > 0.03) {
              vec2 uv = dir.xz / (h + 0.18) * 1.35;
              float c = fbm(uv + vec2(1.7, 0.9));
              float cloudMask = smoothstep(0.50, 0.76, c) * smoothstep(0.03, 0.18, h) * (1.0 - smoothstep(0.65, 0.95, h));
              vec3 cloudCol = mix(vec3(0.93, 0.96, 0.98), vec3(1.0, 0.98, 0.94), 0.65);
              col = mix(col, cloudCol, cloudMask * 0.62);
            }
            // Warm solar glow
            vec3 sunDir = normalize(vec3(0.54, 0.46, 0.69));
            float sunDot = max(dot(dir, sunDir), 0.0);
            col += vec3(1.0, 0.92, 0.76) * pow(sunDot, 16.0) * 0.28;
          } else {
            col = mix(horizonColor, bottomColor, pow(-h, 0.45));
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // =========================================================================
    // PHOTOREALISTIC GRASS LAWN, 3D INSTANCED GRASS BLADES & TROPICAL GREENERY
    // =========================================================================
    function createLushBotanicalEnvironment() {
      const maxAniso = renderer.capabilities.getMaxAnisotropy();

      // 1. High-Resolution 1024x1024 Grass Lawn Diffuse + Normal Map
      const grassCanvas = document.createElement('canvas');
      grassCanvas.width = 1024;
      grassCanvas.height = 1024;
      const gctx = grassCanvas.getContext('2d');

      // Rich organic meadow base gradient
      gctx.fillStyle = '#3F6A29';
      gctx.fillRect(0, 0, 1024, 1024);

      // Dappled organic turf & clover patches
      let seed = 1337;
      function rand() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      }
      const patchColors = ['#355C22', '#47752F', '#528336', '#3A6325', '#5C8E3C', '#2E501C'];
      for (let i = 0; i < 420; i++) {
        const px = rand() * 1024;
        const py = rand() * 1024;
        const pr = 24 + rand() * 75;
        const grad = gctx.createRadialGradient(px, py, 2, px, py, pr);
        const col = patchColors[i % patchColors.length];
        grad.addColorStop(0, col);
        grad.addColorStop(1, 'rgba(63, 106, 41, 0)');
        gctx.fillStyle = grad;
        gctx.beginPath();
        gctx.arc(px, py, pr, 0, Math.PI * 2);
        gctx.fill();
      }

      // 38,000 individual directional grass blades painted into texture
      const bladePalette = ['#2B4C1B', '#386223', '#4A7B31', '#5B8F3D', '#6EA34B', '#7EB257', '#32561F'];
      gctx.lineCap = 'round';
      for (let i = 0; i < 38000; i++) {
        const bx = rand() * 1024;
        const by = rand() * 1024;
        const len = 5 + rand() * 11;
        const ang = -Math.PI * 0.5 + (rand() - 0.5) * 0.85;
        gctx.strokeStyle = bladePalette[i % bladePalette.length];
        gctx.lineWidth = 1.0 + rand() * 1.4;
        gctx.beginPath();
        gctx.moveTo(bx, by);
        gctx.lineTo(bx + Math.cos(ang) * len, by + Math.sin(ang) * len);
        gctx.stroke();
      }

      // Matching Grass Blade Normal Map (1024x1024)
      const normCanvas = document.createElement('canvas');
      normCanvas.width = 512;
      normCanvas.height = 512;
      const nctx = normCanvas.getContext('2d');
      nctx.fillStyle = 'rgb(128, 128, 255)';
      nctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 18000; i++) {
        const nx = rand() * 512;
        const ny = rand() * 512;
        const r = Math.floor(100 + rand() * 56);
        const g = Math.floor(105 + rand() * 50);
        nctx.strokeStyle = `rgb(${r},${g},245)`;
        nctx.lineWidth = 1.5;
        nctx.beginPath();
        nctx.moveTo(nx, ny);
        nctx.lineTo(nx + (rand() - 0.5) * 4, ny - 4 - rand() * 5);
        nctx.stroke();
      }

      const grassTex = new THREE.CanvasTexture(grassCanvas);
      grassTex.wrapS = THREE.RepeatWrapping;
      grassTex.wrapT = THREE.RepeatWrapping;
      grassTex.repeat.set(38, 38);
      grassTex.colorSpace = THREE.SRGBColorSpace || 'srgb';
      grassTex.anisotropy = maxAniso;

      const grassNorm = new THREE.CanvasTexture(normCanvas);
      grassNorm.wrapS = THREE.RepeatWrapping;
      grassNorm.wrapT = THREE.RepeatWrapping;
      grassNorm.repeat.set(38, 38);
      grassNorm.anisotropy = maxAniso;

      const groundGeo = new THREE.CircleGeometry(165, 72);
      groundGeo.rotateX(-Math.PI / 2);
      const groundMat = new THREE.MeshStandardMaterial({
        map: grassTex,
        normalMap: grassNorm,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.86,
        metalness: 0.02
      });
      const groundMesh = new THREE.Mesh(groundGeo, groundMat);
      groundMesh.position.y = -0.525;
      groundMesh.receiveShadow = true;
      scene.add(groundMesh);

      // 2. Soft Contact Shadow / AO Apron under the Villa Plinth & Steps
      const aoCanvas = document.createElement('canvas');
      aoCanvas.width = 256;
      aoCanvas.height = 256;
      const actx = aoCanvas.getContext('2d');
      const aoGrad = actx.createRadialGradient(128, 128, 35, 128, 128, 124);
      aoGrad.addColorStop(0, 'rgba(18, 32, 12, 0.65)');
      aoGrad.addColorStop(0.65, 'rgba(22, 38, 14, 0.30)');
      aoGrad.addColorStop(1, 'rgba(22, 38, 14, 0.0)');
      actx.fillStyle = aoGrad;
      actx.fillRect(0, 0, 256, 256);
      const aoTex = new THREE.CanvasTexture(aoCanvas);
      const aoPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(9.6, 12.6),
        new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false })
      );
      aoPlane.rotation.x = -Math.PI / 2;
      aoPlane.position.set(0.0, -0.518, 0.35);
      scene.add(aoPlane);

      // 3. Architectural Limestone Stepping Pavers across the Grass Lawn to the Porch Steps
      const paverMat = new THREE.MeshStandardMaterial({
        color: 0xD8CFC2,
        roughness: 0.78,
        metalness: 0.04
      });
      const paverCoords = [
        [-0.55, 5.65, 1.35, 0.58],
        [-0.50, 6.45, 1.25, 0.56],
        [-0.42, 7.25, 1.22, 0.56],
        [-0.30, 8.05, 1.20, 0.56],
        [-0.18, 8.85, 1.20, 0.56],
        [-0.08, 9.65, 1.25, 0.58]
      ];
      paverCoords.forEach(([px, pz, pw, pd]) => {
        const paver = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.045, pd), paverMat);
        paver.position.set(px, -0.505, pz);
        paver.receiveShadow = true;
        paver.castShadow = true;
        scene.add(paver);
      });

      // 6. Distant Verdant Forested Hills Ring on the Horizon
      const hillGeo = new THREE.CylinderGeometry(145, 155, 18, 64, 1, true);
      const posAttr = hillGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const y = posAttr.getY(i);
        if (y > 0) {
          const ang = Math.atan2(posAttr.getZ(i), posAttr.getX(i));
          const wave = Math.sin(ang * 5.0) * 3.2 + Math.cos(ang * 9.0) * 1.8 + Math.sin(ang * 15.0) * 0.9;
          posAttr.setY(i, 4.5 + wave);
        } else {
          posAttr.setY(i, -2.0);
        }
      }
      hillGeo.computeVertexNormals();
      const hillMat = new THREE.MeshStandardMaterial({
        color: 0x3A642B,
        roughness: 0.95,
        metalness: 0.0,
        side: THREE.DoubleSide
      });
      const hillMesh = new THREE.Mesh(hillGeo, hillMat);
      scene.add(hillMesh);
    }
    createLushBotanicalEnvironment();

    const camera = new THREE.PerspectiveCamera(39.6, window.innerWidth / window.innerHeight, 0.08, 1000);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.06;
    orbit.maxPolarAngle = Math.PI * 0.495; // Prevent camera from going below ground!
    orbit.enabled = false;

    // Warm Natural Architectural Lighting
    const hemiLight = new THREE.HemisphereLight(0xFFFBF4, 0xC8B8A2, 1.25);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xFFF1DC, 3.2);
    sunLight.position.set(12.5, 11.2, 14.0);
    const isMobileDevice = window.innerWidth <= 860 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    sunLight.castShadow = true;
    const shadowRes = isMobileDevice ? 2048 : 4096;
    sunLight.shadow.mapSize.set(shadowRes, shadowRes);
    sunLight.shadow.normalBias = 0.012;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 48;
    const d = 12;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.00035;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xF5EADE, 1.35);
    fillLight.position.set(-12, 8.5, 11);
    scene.add(fillLight);

    const interiorLights = [];
    function addWarmPoint(x_b, y_b, z_b, intensity, dist = 8.0) {
      const pt = new THREE.PointLight(0xFFC278, intensity, dist, 1.3);
      pt.position.set(x_b, z_b, -y_b);
      scene.add(pt);
      interiorLights.push({ light: pt, baseIntensity: intensity });
    }
    addWarmPoint(0.0, -0.2, 2.50, 3.0, 10.0);
    addWarmPoint(-1.95, 0.6, 1.35, 2.2, 6.5);
    addWarmPoint(-1.95, 0.6, 2.32, 2.2, 6.5);
    addWarmPoint(-1.85, -0.88, 0.95, 1.9, 5.5);
    addWarmPoint(0.45, 2.8, 2.4, 2.2, 7.0);

    // Camera Perspectives with Smooth Dolly Glide Transitions
    const VIEWS = {
      front:       { pos: new THREE.Vector3(-5.20, 1.45, 10.20), target: new THREE.Vector3(0.25, 1.55, 1.80), fov: 39.6 },
      porch:       { pos: new THREE.Vector3(-0.65, 1.52, 4.95),  target: new THREE.Vector3(-0.45, 1.45, 0.50), fov: 45.0 },
      inside_door: { pos: new THREE.Vector3(0.42, 1.32, 1.65),   target: new THREE.Vector3(0.48, 1.38, -3.35), fov: 48.0 },
      inside_bed:  { pos: new THREE.Vector3(1.75, 1.26, 1.45),   target: new THREE.Vector3(-1.65, 1.32, -1.25), fov: 45.0 },
      aerial:      { pos: new THREE.Vector3(8.20, 5.60, 11.50),  target: new THREE.Vector3(-0.10, 1.15, 0.70), fov: 35.5 }
    };

    let mode = 'walk';
    let yaw = 0, pitch = 0;
    let isPointerLocked = false;
    let isDraggingLook = false;
    let prevMouse = { x: 0, y: 0 };

    // Smooth camera dolly state
    let camGlide = null;

    const doorPivot = new THREE.Group();
    doorPivot.position.set(-0.25, 0.0, 3.90);
    scene.add(doorPivot);
    let doorOpenTarget = 0.0;
    let doorOpenCurrent = 0.0;
    let manualDoorOverride = false;

    function toggleDoor() {
      manualDoorOverride = true;
      doorOpenTarget = doorOpenTarget > 0.5 ? 0.0 : 1.0;
    }
    document.getElementById('btn-door').addEventListener('click', toggleDoor);

    function syncYawPitchFromTarget(pos, target) {
      const dir = new THREE.Vector3().subVectors(target, pos).normalize();
      pitch = Math.asin(Math.max(-0.98, Math.min(0.98, dir.y)));
      yaw = Math.atan2(-dir.x, -dir.z);
    }

    function applyWalkCameraRotation() {
      const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);
    }

    function goToView(key, instant = false) {
      const v = VIEWS[key];
      if (!v) return;

      document.querySelectorAll('.cam-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-cam') === key);
      });

      if (key === 'porch' || key === 'inside_door') {
        doorOpenTarget = 1.0;
      } else if (key === 'front' || key === 'aerial') {
        manualDoorOverride = false;
        doorOpenTarget = 0.0;
      }

      if (instant) {
        camera.fov = v.fov || 39.6;
        camera.updateProjectionMatrix();
        camera.position.copy(v.pos);
        orbit.target.copy(v.target);
        syncYawPitchFromTarget(v.pos, v.target);
        applyWalkCameraRotation();
        if (mode === 'orbit') orbit.update();
        return;
      }

      const currentLookTarget = mode === 'orbit'
        ? orbit.target.clone()
        : camera.position.clone().add(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).multiplyScalar(5.0));

      camGlide = {
        startPos: camera.position.clone(),
        endPos: v.pos.clone(),
        startTarget: currentLookTarget,
        endTarget: v.target.clone(),
        startFov: camera.fov,
        endFov: v.fov || 39.6,
        elapsed: 0,
        duration: 0.82
      };
    }

    goToView('front', true);

    function setMode(newMode) {
      mode = newMode;
      const btnWalk = document.getElementById('btn-walk');
      const btnOrbit = document.getElementById('btn-orbit');
      const crosshair = document.getElementById('crosshair');

      const walkPad = document.getElementById('mobile-walk-pad');
      const isTouchUI = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 860);
      if (mode === 'walk') {
        btnWalk.classList.add('active');
        btnOrbit.classList.remove('active');
        if (walkPad) walkPad.style.display = isTouchUI ? 'grid' : 'none';
        const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
        pitch = Math.asin(Math.max(-0.98, Math.min(0.98, fwd.y)));
        yaw = Math.atan2(-fwd.x, -fwd.z);
        orbit.enabled = false;
        applyWalkCameraRotation();
      } else {
        if (document.pointerLockElement) document.exitPointerLock();
        btnOrbit.classList.add('active');
        btnWalk.classList.remove('active');
        if (walkPad) walkPad.style.display = 'none';
        crosshair.style.display = 'none';
        const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        orbit.target.copy(camera.position).addScaledVector(fwd, 5.0);
        orbit.enabled = true;
        orbit.update();
      }
    }

    document.getElementById('btn-walk').addEventListener('click', () => setMode('walk'));
    document.getElementById('btn-orbit').addEventListener('click', () => setMode('orbit'));

    document.querySelectorAll('[data-cam]').forEach(btn => {
      btn.addEventListener('click', () => goToView(btn.getAttribute('data-cam'), false));
    });

    document.getElementById('sun-slider').addEventListener('input', (e) => {
      const elev = THREE.MathUtils.degToRad(parseFloat(e.target.value));
      const az = THREE.MathUtils.degToRad(38);
      const r = 19;
      sunLight.position.set(r * Math.cos(elev) * Math.sin(az), r * Math.sin(elev), r * Math.cos(elev) * Math.cos(az));
    });

    document.getElementById('led-slider').addEventListener('input', (e) => {
      const scale = parseFloat(e.target.value) / 100.0;
      interiorLights.forEach(item => {
        item.light.intensity = item.baseIntensity * scale;
      });
    });

    function setZoomFOV(targetFov) {
      const clamped = Math.max(16, Math.min(82, targetFov));
      camera.fov = clamped;
      camera.updateProjectionMatrix();
    }

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => setZoomFOV(camera.fov - 5));
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => setZoomFOV(camera.fov + 5));
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => setZoomFOV(39.6));

    window.addEventListener('wheel', (e) => {
      if (e.target.closest('#cladding-sidebar')) return;
      if (mode === 'walk') {
        setZoomFOV(camera.fov + Math.sign(e.deltaY) * 2.8);
      }
    }, { passive: true });

    renderer.domElement.addEventListener('mousedown', (e) => {
      if (mode !== 'walk') return;
      if (e.button === 0) {
        isDraggingLook = true;
        prevMouse.x = e.clientX;
        prevMouse.y = e.clientY;
      }
    });
    window.addEventListener('mouseup', () => { isDraggingLook = false; });
    renderer.domElement.addEventListener('dblclick', () => {
      if (mode === 'walk' && !document.pointerLockElement) {
        renderer.domElement.requestPointerLock();
      }
    });
    document.addEventListener('pointerlockchange', () => {
      isPointerLocked = (document.pointerLockElement === renderer.domElement);
      document.getElementById('crosshair').style.display = isPointerLocked ? 'block' : 'none';
    });
    window.addEventListener('mousemove', (e) => {
      if (mode !== 'walk') return;
      const sens = 0.0024;
      if (isPointerLocked) {
        yaw -= e.movementX * sens;
        pitch = Math.max(-Math.PI * 0.47, Math.min(Math.PI * 0.47, pitch - e.movementY * sens));
        applyWalkCameraRotation();
      } else if (isDraggingLook) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        prevMouse.x = e.clientX;
        prevMouse.y = e.clientY;
        yaw -= dx * sens * 1.2;
        pitch = Math.max(-Math.PI * 0.47, Math.min(Math.PI * 0.47, pitch - dy * sens * 1.2));
        applyWalkCameraRotation();
      }
    });

    const keys = {};
    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      if (e.code === 'Digit1') goToView('front');
      if (e.code === 'Digit2') goToView('porch');
      if (e.code === 'Digit3') goToView('inside_door');
      if (e.code === 'Digit4') goToView('inside_bed');
      if (e.code === 'Digit5') goToView('aerial');
      if (e.code === 'KeyF') toggleDoor();
      if (e.code === 'KeyZ' || e.code === 'Equal' || e.code === 'NumpadAdd') setZoomFOV(camera.fov - 4);
      if (e.code === 'KeyX' || e.code === 'Minus' || e.code === 'NumpadSubtract') setZoomFOV(camera.fov + 4);
      if (e.code === 'Digit0' || e.code === 'Numpad0') setZoomFOV(39.6);
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    // =========================================================================
    // MOBILE & TOUCH INTERACTION ENGINE (1-Finger Look, 2-Finger Pinch Zoom,
    // Virtual Walk D-Pad, Bottom-Sheet Swipe Grabber & Default Mobile Orbit)
    // =========================================================================
    (function initMobileTouchEngine() {
      let touchLookActive = false;
      let prevTouch = { x: 0, y: 0 };
      let prevPinchDist = null;

      renderer.domElement.addEventListener('touchstart', (e) => {
        if (mode !== 'walk') return;
        if (e.touches.length === 1) {
          touchLookActive = true;
          prevTouch.x = e.touches[0].clientX;
          prevTouch.y = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          touchLookActive = false;
          prevPinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });

      renderer.domElement.addEventListener('touchmove', (e) => {
        if (mode !== 'walk') return;
        if (e.touches.length === 1 && touchLookActive) {
          const tx = e.touches[0].clientX;
          const ty = e.touches[0].clientY;
          const dx = tx - prevTouch.x;
          const dy = ty - prevTouch.y;
          prevTouch.x = tx;
          prevTouch.y = ty;
          const sens = 0.0038;
          yaw -= dx * sens;
          pitch = Math.max(-Math.PI * 0.46, Math.min(Math.PI * 0.46, pitch - dy * sens));
          applyWalkCameraRotation();
        } else if (e.touches.length === 2 && prevPinchDist !== null) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const delta = prevPinchDist - dist;
          prevPinchDist = dist;
          setZoomFOV(camera.fov + delta * 0.12);
        }
      }, { passive: true });

      renderer.domElement.addEventListener('touchend', () => {
        touchLookActive = false;
        prevPinchDist = null;
      }, { passive: true });

      // Wire up On-Screen Mobile Walk D-Pad Buttons
      document.querySelectorAll('#mobile-walk-pad .m-pad-btn').forEach((btn) => {
        const keyCode = btn.getAttribute('data-mkey');
        if (!keyCode) return;
        const press = (ev) => {
          ev.preventDefault();
          keys[keyCode] = true;
          btn.classList.add('pressed');
        };
        const release = (ev) => {
          ev.preventDefault();
          keys[keyCode] = false;
          btn.classList.remove('pressed');
        };
        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
        btn.addEventListener('touchcancel', release, { passive: false });
        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
      });

      // Mobile Bottom-Sheet Grabber Tap & Vertical Swipe Gesture
      const grabber = document.getElementById('mobile-sheet-grabber');
      let grabStartY = null;
      if (grabber) {
        grabber.addEventListener('click', () => {
          document.body.classList.toggle('sidebar-collapsed');
        });
        grabber.addEventListener('touchstart', (e) => {
          if (e.touches.length === 1) grabStartY = e.touches[0].clientY;
        }, { passive: true });
        grabber.addEventListener('touchend', (e) => {
          if (grabStartY !== null && e.changedTouches.length === 1) {
            const dy = e.changedTouches[0].clientY - grabStartY;
            if (dy > 28) {
              document.body.classList.add('sidebar-collapsed');
            } else if (dy < -28) {
              document.body.classList.remove('sidebar-collapsed');
            }
          }
          grabStartY = null;
        }, { passive: true });
      }

      // On mobile screens, default to 3D Orbit Mode so 1-finger drag orbits the villa
      // and pinch zooms immediately
      if (isMobileDevice) {
        setMode('orbit');
      }
    })();

    // =========================================================================
    // MULTI-RESIDENCE ARCHITECTURAL CONFIGURATIONS (Forza 01 · Tengo 26 · Kray QN)
    // =========================================================================
    const MODEL_CONFIGS = {
      forza: {
        key: 'forza',
        title: 'FORZA 01',
        subtitle: 'Forza 01 Villa & Luxury Suite',
        url: 'tropical_house.glb?v=16',
        basePrice: 48500,
        hasDoor: true,
        shadowSpan: 12,
        areas: { ext_roof: 42, ext_wall: 54, flooring: 36, int_ceiling: 38, int_wall: 48 },
        defaults: {
          ext_roof: 'Default Natural Thatch & Outward Straws',
          ext_wall: 'Default Warm Timber & Bronze Trim',
          flooring: 'Default Wide-Plank European Oak',
          int_ceiling: 'Default Bamboo Slats & Rafters',
          int_wall: 'Default Warm Travertine Plaster'
        },
        views: {
          front:       { pos: new THREE.Vector3(-5.20, 1.45, 10.20), target: new THREE.Vector3(0.25, 1.55, 1.80), fov: 39.6 },
          porch:       { pos: new THREE.Vector3(-0.65, 1.52, 4.95),  target: new THREE.Vector3(-0.45, 1.45, 0.50), fov: 45.0 },
          inside_door: { pos: new THREE.Vector3(0.42, 1.32, 1.65),   target: new THREE.Vector3(0.48, 1.38, -3.35), fov: 48.0 },
          inside_bed:  { pos: new THREE.Vector3(1.75, 1.26, 1.45),   target: new THREE.Vector3(-1.65, 1.32, -1.25), fov: 45.0 },
          aerial:      { pos: new THREE.Vector3(8.20, 5.60, 11.50),  target: new THREE.Vector3(-0.10, 1.15, 0.70), fov: 35.5 }
        }
      },
      tengo: {
        key: 'tengo',
        title: 'TENGO 26',
        subtitle: 'Tengo 26-08-21 Architectural Residence',
        url: 'tengo_optimized.glb?v=16',
        basePrice: 64000,
        hasDoor: false,
        shadowSpan: 15,
        areas: { ext_roof: 118, ext_wall: 110, flooring: 96, int_ceiling: 98, int_wall: 105 },
        defaults: {
          ext_roof: 'Default Natural Thatch & Outward Straws',
          ext_wall: 'Default Tengo Exterior Cladding',
          flooring: 'Default Tengo Hardwood & Terrace Deck',
          int_ceiling: 'Default Tengo Timber Soffit & Ceiling',
          int_wall: 'Default Tengo Interior Wall Finish'
        },
        views: {
          front:       { pos: new THREE.Vector3(-11.50, 1.85, 13.80), target: new THREE.Vector3(0.00, 1.65, 0.00), fov: 41.0 },
          porch:       { pos: new THREE.Vector3(0.00, 1.55, 8.40),    target: new THREE.Vector3(0.00, 1.50, -0.50), fov: 45.0 },
          inside_door: { pos: new THREE.Vector3(-1.80, 1.55, 2.40),   target: new THREE.Vector3(1.80, 1.45, -2.50), fov: 48.0 },
          inside_bed:  { pos: new THREE.Vector3(2.80, 1.55, 1.80),    target: new THREE.Vector3(-2.80, 1.40, -1.80), fov: 46.0 },
          aerial:      { pos: new THREE.Vector3(14.50, 9.20, 16.50),  target: new THREE.Vector3(0.00, 1.25, 0.00), fov: 38.0 }
        }
      },
      kray: {
        key: 'kray',
        title: 'KRAY QN',
        subtitle: 'Kray QN Luxury Architectural Pavilion',
        url: 'kray_optimized.glb?v=16',
        basePrice: 56500,
        hasDoor: false,
        shadowSpan: 13,
        areas: { ext_roof: 82, ext_wall: 76, flooring: 68, int_ceiling: 72, int_wall: 84 },
        defaults: {
          ext_roof: 'Default Natural Thatch & Outward Straws',
          ext_wall: 'Default Kray Exterior Facade',
          flooring: 'Default Kray Stone & Timber Flooring',
          int_ceiling: 'Default Kray Slatted Ceiling',
          int_wall: 'Default Kray Interior Partition Finish'
        },
        views: {
          front:       { pos: new THREE.Vector3(-9.20, 1.85, 11.40),  target: new THREE.Vector3(0.00, 1.75, 0.00), fov: 41.0 },
          porch:       { pos: new THREE.Vector3(0.00, 1.55, 6.80),    target: new THREE.Vector3(0.00, 1.55, -0.80), fov: 45.0 },
          inside_door: { pos: new THREE.Vector3(-1.10, 1.55, 1.90),   target: new THREE.Vector3(1.40, 1.50, -2.40), fov: 48.0 },
          inside_bed:  { pos: new THREE.Vector3(2.10, 1.55, 1.50),    target: new THREE.Vector3(-2.10, 1.45, -1.60), fov: 46.0 },
          aerial:      { pos: new THREE.Vector3(11.50, 8.20, 13.50),  target: new THREE.Vector3(0.00, 1.50, 0.00), fov: 38.0 }
        }
      }
    };

    const sourceProfile = MODEL_CONFIGS[okno.profile] || MODEL_CONFIGS.forza;
    MODEL_CONFIGS[okno.profile] = { ...sourceProfile, key: okno.profile, title: okno.name, subtitle: okno.name + ' · Material studio', url: okno.url, hasDoor: okno.profile === 'forza' };
    let currentModelKey = okno.profile;
    let activeModelRoot = null;
    let BASE_MODEL_PRICE = MODEL_CONFIGS.forza.basePrice;

    // =========================================================================
    // CLADDING MATERIALS — SPECIFICATION, PRICING & PDF QUOTE CONTROLLER
    // =========================================================================
    const PART_META = {
      ext_roof:    { name: 'EXTERNAL ROOF',    short: 'Ext. Roof',    count: 10, areaSqm: 42, defaultLabel: 'Default Natural Thatch & Outward Straws', bestView: 'aerial' },
      ext_wall:    { name: 'EXTERNAL WALL',    short: 'Ext. Wall',    count: 10, areaSqm: 54, defaultLabel: 'Default Warm Timber & Bronze Trim', bestView: 'front' },
      flooring:    { name: 'FLOORING',         short: 'Flooring',     count: 8,  areaSqm: 36, defaultLabel: 'Default Wide-Plank European Oak', bestView: 'inside_bed' },
      int_ceiling: { name: 'INTERNAL CEILING', short: 'Int. Ceiling', count: 17, areaSqm: 38, defaultLabel: 'Default Bamboo Slats & Rafters', bestView: 'inside_door' },
      int_wall:    { name: 'INTERNAL WALL',    short: 'Int. Wall',    count: 12, areaSqm: 48, defaultLabel: 'Default Warm Travertine Plaster', bestView: 'inside_bed' },
      all:         { name: 'COMPLETE 26-FINISH REGISTER', short: 'All 26', count: 26, areaSqm: 45, defaultLabel: 'Select any zone badge on a card to apply', bestView: 'front' }
    };

    const MATERIAL_UNIT_RATES = {
      '01': 45, '02': 48, '03': 44, '04': 52, '05': 54,
      '06': 38, '07': 40, '08': 42, '09': 62, '10': 58,
      '11': 56, '12': 36, '13': 50, '14': 39, '15': 68,
      '16': 64, '17': 60, '18': 82, '19': 70, '20': 88,
      '21': 76, '22': 65, '23': 62, '24': 64, '25': 72, '26': 59
    };

    const partMeshes = {
      ext_roof: [],
      ext_wall: [],
      flooring: [],
      int_ceiling: [],
      int_wall: [],
      int_wall_feature: []
    };

    const activePartSelection = {
      ext_roof: null,
      ext_wall: null,
      flooring: null,
      int_ceiling: null,
      int_wall: null
    };

    let currentPartTab = 'ext_roof';
    const loadedCatalogTextures = {};
    const texLoader = new THREE.TextureLoader();

    function getPartAreaSqm(partKey) {
      if (partKey === 'int_wall' && document.getElementById('chk-include-feature')?.checked) {
        return PART_META.int_wall.areaSqm + 10;
      }
      return (PART_META[partKey] && PART_META[partKey].areaSqm) ? PART_META[partKey].areaSqm : 45;
    }

    function getMaterialPartCost(itemId, partKey) {
      const rate = MATERIAL_UNIT_RATES[itemId] || 45;
      const area = getPartAreaSqm(partKey === 'all' ? 'ext_wall' : partKey);
      return Math.round(rate * area);
    }

    function formatUSD(amount) {
      return '$' + Math.round(amount).toLocaleString('en-US');
    }

    let displayedTotalPrice = BASE_MODEL_PRICE;
    let priceAnimFrame = null;

    function animateTotalPriceTo(targetTotal) {
      const el = document.getElementById('ui-total-price');
      if (!el) return;
      if (priceAnimFrame) cancelAnimationFrame(priceAnimFrame);
      const startVal = displayedTotalPrice;
      const diff = targetTotal - startVal;
      if (diff === 0) {
        el.textContent = formatUSD(targetTotal);
        return;
      }
      const duration = 360;
      const startTime = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        displayedTotalPrice = Math.round(startVal + diff * eased);
        el.textContent = formatUSD(displayedTotalPrice);
        if (t < 1) {
          priceAnimFrame = requestAnimationFrame(tick);
        } else {
          displayedTotalPrice = targetTotal;
          el.textContent = formatUSD(targetTotal);
        }
      }
      priceAnimFrame = requestAnimationFrame(tick);
    }

    function computePricingSummary() {
      const partKeys = ['ext_roof', 'ext_wall', 'flooring', 'int_ceiling', 'int_wall'];
      let upgradeTotal = 0;
      let customizedCount = 0;
      const lines = partKeys.map(pk => {
        const sel = activePartSelection[pk];
        const area = getPartAreaSqm(pk);
        const rate = sel ? (MATERIAL_UNIT_RATES[sel.id] || 45) : 0;
        const cost = sel ? Math.round(rate * area) : 0;
        if (sel) {
          upgradeTotal += cost;
          customizedCount++;
        }
        return {
          partKey: pk,
          partName: PART_META[pk].name,
          partShort: PART_META[pk].short,
          areaSqm: area,
          selected: sel,
          unitRate: rate,
          cost: cost
        };
      });
      return {
        basePrice: BASE_MODEL_PRICE,
        upgradeTotal,
        grandTotal: BASE_MODEL_PRICE + upgradeTotal,
        customizedCount,
        lines
      };
    }

    function classifyMeshToPart(name) {
      if (!name) return null;
      if (
        name === 'empty_847' ||
        name === 'empty_850' ||
        name === 'Ceiling_Ridge_Beam' ||
        name.startsWith('Bamboo_Slat_') ||
        name.startsWith('Rafter_')
      ) {
        return 'int_ceiling';
      }
      if (name === 'empty_1000') {
        return 'flooring';
      }
      if (
        name === 'LeftWall_Int_Plaster_Lining' ||
        name === 'RearWall_Int_Plaster_Gable' ||
        name === 'RearWall_Int_Plaster_Lower' ||
        ['empty_984','empty_985','empty_986','empty_987','empty_988','empty_991','empty_992','empty_993',
         'empty_1027','empty_1028','empty_1032','empty_1036','empty_1052','empty_1053','empty_1055','empty_1056'].includes(name)
      ) {
        return 'int_wall';
      }
      if (name.startsWith('Limestone_Panel_') || name === 'Sculpted_Limestone_Wall' || name === 'Feature_Stone_Mortar_Backing') {
        return 'int_wall_feature';
      }
      if (
        name === 'Front_Wood_Entrance_Door' ||
        name === 'LeftWall_Patch_Ext_1' ||
        name === 'LeftWall_Patch_Ext_2' ||
        ['empty_838','empty_842','empty_846','empty_853','empty_855',
         'empty_907','empty_908','empty_911','empty_912',
         'empty_973','empty_974','empty_975','empty_976',
         'empty_1004','empty_1005','empty_1006','empty_1007','empty_1008',
         'empty_1013','empty_1014','empty_1015','empty_1016','empty_1017','empty_1018',
         'empty_1030','empty_1031','empty_1035','empty_1037','empty_1038',
         'empty_1043','empty_1044','empty_1046','empty_1047','empty_1048',
         'empty_1068','empty_1069','empty_1070','empty_1071'].includes(name)
      ) {
        return 'ext_wall';
      }
      if (name.startsWith('Extended_Thatch_')) {
        return 'ext_roof';
      }
      if (name.startsWith('empty_')) {
        const num = parseInt(name.replace('empty_', ''), 10);
        if (!isNaN(num)) {
          if (num >= 921 && num <= 967) return 'ext_wall';
          if (
            [839,840,841,843,844,845,848,849,851,852,854].includes(num) ||
            (num >= 856 && num <= 906)
          ) {
            return 'ext_roof';
          }
        }
      }
      return null;
    }

    function ensureWorldSpaceUVs(mesh, partKey) {
      if (mesh.userData.hasWorldUVs) return;
      mesh.geometry = mesh.geometry.clone();
      const geom = mesh.geometry;
      if (!geom.attributes.normal) {
        geom.computeVertexNormals();
      }
      mesh.updateMatrixWorld(true);
      const posAttr = geom.attributes.position;
      const normAttr = geom.attributes.normal;
      const count = posAttr.count;
      const uvs = new Float32Array(count * 2);

      const vWorld = new THREE.Vector3();
      const nWorld = new THREE.Vector3();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
      const baseTileSize = 1.65;

      for (let i = 0; i < count; i++) {
        vWorld.fromBufferAttribute(posAttr, i).applyMatrix4(mesh.matrixWorld);
        nWorld.fromBufferAttribute(normAttr, i).applyMatrix3(normalMatrix).normalize();

        let u = 0, v = 0;
        if (partKey === 'flooring' || partKey === 'ext_roof' || partKey === 'int_ceiling') {
          u = vWorld.x / baseTileSize;
          v = vWorld.z / baseTileSize;
        } else {
          if (Math.abs(nWorld.x) > Math.abs(nWorld.z)) {
            u = vWorld.z / baseTileSize;
            v = vWorld.y / baseTileSize;
          } else {
            u = vWorld.x / baseTileSize;
            v = vWorld.y / baseTileSize;
          }
        }
        uvs[i * 2] = u;
        uvs[i * 2 + 1] = v;
      }
      geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geom.attributes.uv.needsUpdate = true;
      mesh.userData.hasWorldUVs = true;
    }

    function getCatalogMaterial(item, partKey) {
      const cacheKey = item.id + '_' + partKey;
      if (loadedCatalogTextures[cacheKey]) return loadedCatalogTextures[cacheKey];

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const repScale = (item.repeat && item.repeat[0]) ? (item.repeat[0] / 3.0) : 1.0;

      const diffTex = texLoader.load(item.texDataUri);
      diffTex.wrapS = THREE.RepeatWrapping;
      diffTex.wrapT = THREE.RepeatWrapping;
      diffTex.repeat.set(repScale, repScale);
      diffTex.colorSpace = THREE.SRGBColorSpace || 'srgb';
      diffTex.anisotropy = maxAniso;

      const normTex = texLoader.load(item.normDataUri);
      normTex.wrapS = THREE.RepeatWrapping;
      normTex.wrapT = THREE.RepeatWrapping;
      normTex.repeat.set(repScale, repScale);
      normTex.anisotropy = maxAniso;

      const bumpStrength = (item.bumpScale || 0.015) * 24.0;
      // Cap metalness at 0.32 so metallic finishes retain their rich architectural color under sun & sky light without turning black!
      const balancedMetalness = Math.min(0.32, item.metalness !== undefined ? item.metalness * 0.42 : 0.05);
      const balancedRoughness = Math.max(0.28, item.roughness !== undefined ? item.roughness : 0.55);

      const mat = new THREE.MeshStandardMaterial({
        name: 'Cladding_' + item.id + '_' + item.name,
        map: diffTex,
        normalMap: normTex,
        normalScale: new THREE.Vector2(bumpStrength, bumpStrength),
        roughness: balancedRoughness,
        metalness: balancedMetalness,
        envMapIntensity: 1.15,
        side: THREE.DoubleSide
      });

      loadedCatalogTextures[cacheKey] = mat;
      return mat;
    }

    let toastTimer = null;
    function showMaterialToast(msg) {
      const toast = document.getElementById('material-toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
    }

    function applyMaterialToPart(partKey, itemId) {
      const catalog = window.CLADDING_CATALOG || [];
      const item = catalog.find(m => m.id === itemId);
      if (!item) return;

      const targets = [...(partMeshes[partKey] || [])];
      if (partKey === 'int_wall' && document.getElementById('chk-include-feature')?.checked) {
        targets.push(...(partMeshes.int_wall_feature || []));
      }

      if (!targets.length) { showMaterialToast('This surface is not mapped in this model yet.'); return; }
      const newMat = getCatalogMaterial(item, partKey);
      targets.forEach(mesh => {
        ensureWorldSpaceUVs(mesh, partKey);
        mesh.material = newMat;
      });

      activePartSelection[partKey] = item;
      updateSidebarUI();
      const addedCost = getMaterialPartCost(item.id, partKey);
      showMaterialToast(`Applied ${item.name} to ${PART_META[partKey].name}`);
    }

    function resetPartMaterial(partKey) {
      const targets = [...(partMeshes[partKey] || [])];
      if (partKey === 'int_wall') {
        targets.push(...(partMeshes.int_wall_feature || []));
      }
      targets.forEach(mesh => {
        if (mesh.userData.origMaterial) {
          mesh.material = mesh.userData.origMaterial;
        }
      });
      activePartSelection[partKey] = null;
      updateSidebarUI();
      showMaterialToast(`Restored ${PART_META[partKey].name} to default finish`);
    }

    function resetAllMaterials() {
      ['ext_roof', 'ext_wall', 'flooring', 'int_ceiling', 'int_wall'].forEach(pk => {
        const targets = [...(partMeshes[pk] || [])];
        if (pk === 'int_wall') targets.push(...(partMeshes.int_wall_feature || []));
        targets.forEach(mesh => {
          if (mesh.userData.origMaterial) mesh.material = mesh.userData.origMaterial;
        });
        activePartSelection[pk] = null;
      });
      updateSidebarUI();
      showMaterialToast('Restored all zones to default architectural finishes');
    }

    function selectPartTab(partKey, triggerCamera = true) {
      currentPartTab = partKey;
      const lblFeature = document.getElementById('lbl-include-feature');
      if (lblFeature) {
        lblFeature.style.display = (partKey === 'int_wall') ? 'flex' : 'none';
      }
      if (triggerCamera && document.getElementById('chk-auto-view')?.checked && PART_META[partKey]?.bestView) {
        goToView(PART_META[partKey].bestView, false);
      }
      updateSidebarUI();
    }

    function updateSidebarUI() {
      document.querySelectorAll('.part-tab').forEach(btn => {
        const pk = btn.getAttribute('data-part');
        btn.classList.toggle('active', pk === currentPartTab);
        if (pk && pk !== 'all') {
          btn.classList.toggle('customized', !!activePartSelection[pk]);
        }
      });

      const meta = PART_META[currentPartTab] || PART_META.ext_roof;
      const titleEl = document.getElementById('ap-part-title');
      const curEl = document.getElementById('ap-current-mat');
      if (titleEl) {
        titleEl.textContent = currentPartTab === 'all'
          ? 'ALL 26 REGISTER FINISHES'
          : meta.name;
      }
      if (curEl) {
        if (currentPartTab === 'all') {
          curEl.innerHTML = 'Hover any sample to inspect · Click to apply';
        } else {
          const sel = activePartSelection[currentPartTab];
          const selCost = sel ? getMaterialPartCost(sel.id, currentPartTab) : 0;
          if (sel) {
            curEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:7px;"><img src="${sel.texDataUri}" style="width:20px;height:20px;border-radius:5px;object-fit:cover;border:1px solid rgba(0,0,0,0.2);" /><span><strong>#${sel.id} ${sel.name}</strong></span></span>`;
          } else {
            curEl.textContent = `${meta.defaultLabel} (Included)`;
          }
        }
      }

      document.getElementById('ui-total-price').textContent = 'Material studio';
      document.getElementById('ui-upgrade-price').textContent = 'Explore and customise';
      const drawer = document.getElementById('price-breakdown-drawer');
      drawer.replaceChildren();
      Object.keys(activePartSelection).forEach(key => {
        const row = document.createElement('div'); row.className = 'bd-row';
        row.textContent = PART_META[key].short + ': ' + (activePartSelection[key]?.name || 'Original finish');
        drawer.appendChild(row);
      });

      const grid = document.getElementById('swatch-grid');
      if (!grid) return;
      const catalog = window.CLADDING_CATALOG || [];
      const filtered = currentPartTab === 'all'
        ? catalog
        : catalog.filter(item => item.apps && item.apps.includes(currentPartTab));

      grid.innerHTML = '';
      let lastCategory = '';

      filtered.forEach(item => {
        if (item.category !== lastCategory) {
          lastCategory = item.category;
          const catHeader = document.createElement('div');
          catHeader.className = 'cat-section-header';
          catHeader.textContent = item.category;
          grid.appendChild(catHeader);
        }

        const isSelected = currentPartTab !== 'all' &&
          activePartSelection[currentPartTab] &&
          activePartSelection[currentPartTab].id === item.id;

        const card = document.createElement('div');
        card.className = 'swatch-card' + (isSelected ? ' selected' : '');
        card.tabIndex = 0; card.setAttribute('role','button'); card.setAttribute('aria-label', 'Apply ' + item.name); card.setAttribute('aria-pressed', String(Boolean(isSelected)));
        card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });

        const pillsHtml = (item.apps || []).map(appKey => {
          const isAppActive = activePartSelection[appKey] && activePartSelection[appKey].id === item.id;
          return `<span class="swatch-pill ${isAppActive ? 'active-pill' : ''}" data-apply-part="${appKey}" title="Apply ${item.name} to ${PART_META[appKey].name}">${PART_META[appKey].short}</span>`;
        }).join('');

        const unitRate = MATERIAL_UNIT_RATES[item.id] || 45;
        const partForCost = currentPartTab === 'all' ? (item.apps[0] || 'ext_wall') : currentPartTab;
        const estPartCost = getMaterialPartCost(item.id, partForCost);
        const costBadgeText = currentPartTab === 'all'
          ? `$${unitRate}/m²`
          : `+${formatUSD(estPartCost)}`;

        card.innerHTML = `
          <div class="swatch-thumb-wrap" title="Material Sample: #${item.id} ${item.name}">
            <img class="swatch-thumb-img" src="${item.texDataUri}" alt="${item.name} Material Sample" loading="lazy" />
            <span class="swatch-num">#${item.id}</span>
            <span class="swatch-check">✓</span>
          </div>
          <div class="swatch-body">
            <div class="swatch-title-row">
              <div class="swatch-name-wrap">
                <img class="swatch-inline-chip" src="${item.texDataUri}" alt="" />
                <div class="swatch-name">${item.id} · ${item.name}</div>
              </div>
              <span class="swatch-price-tag">${costBadgeText}</span>
            </div>
            <div class="swatch-cat">${item.category.replace(/^[IVX]+\.\s*/, '')}</div>
            <div class="swatch-pills">${pillsHtml}</div>
          </div>
        `;

        card.addEventListener('mouseenter', () => {
          const loupe = document.getElementById('swatch-hover-loupe');
          const lImg = document.getElementById('loupe-sample-img');
          const lTitle = document.getElementById('loupe-sample-title');
          const lSub = document.getElementById('loupe-sample-sub');
          if (loupe && lImg && lTitle && lSub) {
            lImg.src = item.texDataUri;
            lTitle.textContent = `#${item.id} · ${item.name}`;
            const zonesText = (item.apps || []).map(a => PART_META[a]?.short || a).join(', ');
            lSub.innerHTML = `<strong>${item.category.replace(/^[IVX]+\.\s*/, '')}</strong><br/>Applicable to: ${zonesText}`;
            loupe.classList.add('visible');
          }
        });
        card.addEventListener('mouseleave', () => {
          document.getElementById('swatch-hover-loupe')?.classList.remove('visible');
        });

        card.addEventListener('click', (e) => {
          const pill = e.target.closest('[data-apply-part]');
          if (pill) {
            e.stopPropagation();
            const targetPart = pill.getAttribute('data-apply-part');
            applyMaterialToPart(targetPart, item.id);
            return;
          }
          if (currentPartTab !== 'all') {
            applyMaterialToPart(currentPartTab, item.id);
          } else if (item.apps && item.apps.length > 0) {
            applyMaterialToPart(item.apps[0], item.id);
          }
        });

        grid.appendChild(card);
      });
    }

    document.querySelectorAll('.part-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        selectPartTab(btn.getAttribute('data-part'), true);
      });
    });

    document.getElementById('btn-view-part')?.addEventListener('click', () => {
      const meta = PART_META[currentPartTab];
      if (meta && meta.bestView) goToView(meta.bestView, false);
    });

    document.getElementById('btn-reset-part')?.addEventListener('click', () => {
      if (currentPartTab !== 'all') resetPartMaterial(currentPartTab);
    });

    document.getElementById('btn-reset-all-mats')?.addEventListener('click', resetAllMaterials);

    document.getElementById('chk-include-feature')?.addEventListener('change', () => {
      if (activePartSelection.int_wall) {
        applyMaterialToPart('int_wall', activePartSelection.int_wall.id);
      } else {
        resetPartMaterial('int_wall');
      }
    });

    document.getElementById('sidebar-toggle-btn')?.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
    });

    document.getElementById('btn-toggle-breakdown')?.addEventListener('click', () => {
      document.getElementById('price-breakdown-drawer')?.classList.toggle('open');
    });

    // Raycast click on 3D house to select that zone in the Atelier panel
    const raycaster = new THREE.Raycaster();
    const pointerDownPos = { x: 0, y: 0 };
    renderer.domElement.addEventListener('mousedown', (e) => {
      pointerDownPos.x = e.clientX;
      pointerDownPos.y = e.clientY;
    });
    renderer.domElement.addEventListener('mouseup', (e) => {
      if (e.button !== 0 || isPointerLocked) return;
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const hit of hits) {
        if (hit.object && hit.object.isMesh && hit.object.userData.housePartKey) {
          const pk = hit.object.userData.housePartKey === 'int_wall_feature' ? 'int_wall' : hit.object.userData.housePartKey;
          if (pk !== currentPartTab) {
            selectPartTab(pk, false);
            showMaterialToast(`Selected ${PART_META[pk].name} — Choose a finish in the Atelier panel`);
          }
          break;
        }
      }
    });

    function loadImageAsync(src) {
      return new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    }

    function buildPdfFromJpegDataUrl(jpegDataUrl, imgWidthPx, imgHeightPx) {
      const base64Data = jpegDataUrl.split(',')[1];
      const binStr = atob(base64Data);
      const imgBytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) {
        imgBytes[i] = binStr.charCodeAt(i);
      }

      const pageW = 595.28;
      const pageH = 841.89;
      const contentStream = 'q\n' + pageW.toFixed(2) + ' 0 0 ' + pageH.toFixed(2) + ' 0 0 cm\n/Im0 Do\nQ\n';

      const encoder = new TextEncoder();
      const chunks = [];
      const offsets = [];
      let byteLength = 0;

      function pushStr(str) {
        const bytes = encoder.encode(str);
        chunks.push(bytes);
        byteLength += bytes.length;
      }
      function pushBytes(bytes) {
        chunks.push(bytes);
        byteLength += bytes.length;
      }
      function startObj(id) {
        offsets[id] = byteLength;
        pushStr(id + ' 0 obj\n');
      }
      function endObj() {
        pushStr('\nendobj\n');
      }

      pushStr('%PDF-1.4\n');
      startObj(1); pushStr('<< /Type /Catalog /Pages 2 0 R >>'); endObj();
      startObj(2); pushStr('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'); endObj();
      startObj(3); pushStr('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pageW.toFixed(2) + ' ' + pageH.toFixed(2) + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>'); endObj();
      startObj(4);
      pushStr('<< /Type /XObject /Subtype /Image /Width ' + imgWidthPx + ' /Height ' + imgHeightPx + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + imgBytes.length + ' >>\nstream\n');
      pushBytes(imgBytes);
      pushStr('\nendstream');
      endObj();
      startObj(5); pushStr('<< /Length ' + contentStream.length + ' >>\nstream\n' + contentStream + 'endstream'); endObj();

      const xrefOffset = byteLength;
      pushStr('xref\n0 6\n0000000000 65535 f \n');
      for (let i = 1; i <= 5; i++) {
        const offStr = String(offsets[i]).padStart(10, '0');
        pushStr(offStr + ' 00000 n \n');
      }
      pushStr('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF');

      return new Blob(chunks, { type: 'application/pdf' });
    }

    async function generateAndDownloadSpecificationPDF() {
      try {
        renderWithPhotorealPostProcessing();
        const page = document.createElement('canvas'); page.width = 1240; page.height = 1754;
        const ctx = page.getContext('2d'); ctx.fillStyle = '#f7f4ed'; ctx.fillRect(0, 0, page.width, page.height);
        ctx.fillStyle = '#213329'; ctx.font = 'bold 42px Manrope, sans-serif'; ctx.fillText(okno.name + ' · Materials', 70, 90, 1100);
        ctx.font = '20px Manrope, sans-serif'; ctx.fillText('OKNO · House configuration', 70, 135);
        const shot = renderer.domElement; const height = Math.min(660, 1100 * shot.height / shot.width);
        ctx.drawImage(shot, 70, 180, 1100, height);
        let y = 180 + height + 85;
        Object.keys(activePartSelection).forEach(key => {
          ctx.fillStyle = '#213329'; ctx.font = 'bold 23px Manrope, sans-serif'; ctx.fillText(PART_META[key].short, 70, y);
          ctx.font = '22px Manrope, sans-serif'; ctx.fillText(activePartSelection[key]?.name || 'Original finish', 390, y, 740); y += 86;
        });
        ctx.font = '18px Manrope, sans-serif'; ctx.fillText('Visual material selection. Final specifications and pricing are confirmed by OKNO.', 70, 1640, 1100);
        const blob = buildPdfFromJpegDataUrl(page.toDataURL('image/jpeg', .9), page.width, page.height);
        const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url;
        link.download = okno.slug + '-materials.pdf'; document.body.appendChild(link); link.click(); setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 10000);
        showMaterialToast('Downloaded material specification');
      } catch (error) { showMaterialToast('Could not create the specification. Please try again.'); console.error(error); }
    }

    document.getElementById('btn-download-pdf')?.addEventListener('click', generateAndDownloadSpecificationPDF);

    // Load GLB Model & Upgrade Default Materials so Zero Dark/Black Artifacts Occur
    const loader = new GLTFLoader();

    function findHousePartKey(obj) {
      for (const [zone, names] of Object.entries(okno.mapping || {})) if (names.includes(obj.name)) return zone;
      let cur = obj;
      while (cur) {
        if (cur.userData && cur.userData.housePartKey) return cur.userData.housePartKey;
        if (cur.name && cur.name.startsWith('Extended_Thatch_')) return 'ext_roof';
        cur = cur.parent;
      }
      if (currentModelKey === 'forza') return classifyMeshToPart(obj.name);
      if (currentModelKey === 'custom') {
        const name = (obj.name || '').toLowerCase();
        if (/ceiling|soffit/.test(name)) return 'int_ceiling';
        if (/roof/.test(name)) return 'ext_roof';
        if (/floor|deck/.test(name)) return 'flooring';
        if (/int.*wall|interior.*wall/.test(name)) return 'int_wall';
        if (/ext.*wall|exterior|facade|cladding/.test(name)) return 'ext_wall';
      }
      return null;
    }

    function onModelLoaded(gltf) {
      if (activeModelRoot) {
        scene.remove(activeModelRoot);
        activeModelRoot = null;
      }
      while (doorPivot.children.length > 0) {
        doorPivot.remove(doorPivot.children[0]);
      }
      Object.keys(partMeshes).forEach(k => { partMeshes[k] = []; });

      const root = gltf.scene;
      root.scale.multiplyScalar(okno.scale || 1);
      if (currentModelKey === 'custom') {
        root.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(root); const center = box.getCenter(new THREE.Vector3()); const size = box.getSize(new THREE.Vector3());
        root.position.sub(new THREE.Vector3(center.x, box.min.y, center.z)); root.updateMatrixWorld(true);
        const span = Math.max(size.x, size.z, 4); const eye = Math.min(1.6, Math.max(.6, size.y * .45));
        const v = (x,y,z,tx,ty,tz) => ({pos:new THREE.Vector3(x,y,z),target:new THREE.Vector3(tx,ty,tz),fov:45});
        Object.assign(VIEWS, { front:v(-span,span*.4,span*1.3,0,eye,0), porch:v(0,eye,size.z*.6,0,eye,0), inside_door:v(0,eye,size.z*.3,0,eye,-size.z*.3), inside_bed:v(size.x*.2,eye,0,-size.x*.2,eye,0), aerial:v(span,span,span,0,eye,0) });
        goToView('front', true);
      }
      activeModelRoot = root;
      const doorParts = [];
      const maxAniso = renderer.capabilities.getMaxAnisotropy();

      root.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const partKey = findHousePartKey(child);
          if (partKey && partMeshes[partKey]) {
            child.userData.housePartKey = partKey;
            partMeshes[partKey].push(child);
          }

          if (
            currentModelKey === 'forza' && (
              child.name === 'Front_Wood_Entrance_Door' ||
              child.name === 'Front_Door_Handle_Rose' ||
              child.name === 'Front_Door_Handle_Lever' ||
              child.name === 'Front_Door_Handle_Outer' ||
              child.name === 'Front_Door_Handle_Inner' ||
              child.name.includes('Front_Door_Handle')
            )
          ) {
            doorParts.push(child);
          }

          if (child.material) {
            child.material = child.material.clone();
            const mat = child.material;
            mat.envMapIntensity = 1.2;

            // Soften overly dark/black default GLB materials into warm architectural bronze/slate
            if (mat.color) {
              const lum = mat.color.r * 0.299 + mat.color.g * 0.587 + mat.color.b * 0.114;
              if (lum < 0.08 && (!mat.name || !mat.name.includes('Glass'))) {
                // Warm architectural bronze-slate instead of harsh pitch black
                mat.color.setRGB(0.22, 0.20, 0.18);
                mat.roughness = 0.42;
                mat.metalness = 0.28;
              }
            }
            if (mat.metalness !== undefined && mat.metalness > 0.45) {
              mat.metalness = 0.30;
              mat.roughness = Math.max(0.32, mat.roughness || 0.4);
            }

            if (mat.map) {
              mat.map.wrapS = THREE.RepeatWrapping;
              mat.map.wrapT = THREE.RepeatWrapping;
              mat.map.anisotropy = maxAniso;
              mat.map.needsUpdate = true;
            }
            if (mat.normalMap) {
              mat.normalMap.wrapS = THREE.RepeatWrapping;
              mat.normalMap.wrapT = THREE.RepeatWrapping;
              mat.normalMap.anisotropy = maxAniso;
              mat.normalMap.needsUpdate = true;
            }
            if (mat.name && mat.name.includes('Glass')) {
              mat.transparent = true;
              mat.opacity = 0.20;
              mat.roughness = 0.04;
              mat.metalness = 0.1;
              mat.envMapIntensity = 2.0;
              mat.depthWrite = false;
            } else if (mat.name && mat.name.includes('LED')) {
              mat.emissive = new THREE.Color(0xFFC57A);
              mat.emissiveIntensity = 2.8;
            }

            child.userData.origMaterial = mat;
          }
        }
      });

      if (currentModelKey === 'forza') {
      // =====================================================================
      // A. FIX THE WEIRD TRIANGULAR SHAPE ON THE BATHROOM DOOR WALL (REAR WALL)
      // RearWall_Int_Plaster_Gable had a diagonal base from Y=2.15 to Y=2.84
      // while RearWall_Int_Plaster_Lower stopped flat at Y=2.165, leaving a
      // triangular gap right above the bathroom door! Plus LED_RearGable_Left/Right
      // formed an angled V-triangle on that wall.
      // We hide those fragmented pieces and replace them with a single, 100%
      // flush, seamless 5-vertex polygonal wall from floor to roof ridge!
      // =====================================================================
      let refPlasterMat = null;
      let refBambooMat = null;
      let refWoodMat = null;
      const toHideRearMeshes = new Set([
        'RearWall_Int_Plaster_Gable',
        'RearWall_Int_Plaster_Lower',
        'LED_RearGable_Left',
        'LED_RearGable_Right',
        'empty_1052',
        'empty_1055'
      ]);

      root.traverse((child) => {
        if (child.isMesh) {
          if (child.name === 'LeftWall_Int_Plaster_Lining' && child.material) {
            refPlasterMat = child.material.clone();
          }
          if (child.name === 'Bamboo_Slat_L_0' && child.material) {
            refBambooMat = child.material.clone();
          }
          if (child.name === 'Ceiling_Ridge_Beam' && child.material) {
            refWoodMat = child.material.clone();
          }
          if (toHideRearMeshes.has(child.name)) {
            child.visible = false;
            const idx = partMeshes.int_wall.indexOf(child);
            if (idx !== -1) partMeshes.int_wall.splice(idx, 1);
          }
        }
      });

      if (!refPlasterMat) {
        refPlasterMat = new THREE.MeshStandardMaterial({
          color: 0xDFD5C5,
          roughness: 0.78,
          metalness: 0.02,
          side: THREE.DoubleSide
        });
      }
      refPlasterMat.side = THREE.DoubleSide;

      // Single continuous 5-vertex Rear Interior Wall Polygon at Z = -3.662
      // Vertices:
      // 0: Bottom-Left  (-2.47, 0.03, -3.662)
      // 1: Bottom-Right (+2.47, 0.03, -3.662)
      // 2: Top-Right    (+2.47, 2.84, -3.662)
      // 3: Ridge Peak   ( 0.50, 4.27, -3.662)
      // 4: Top-Left     (-2.47, 2.15, -3.662)
      // Plus a中间 vertex 5 at (0.50, 0.03, -3.662) for clean quad/triangle tessellation
      const rwZ = -3.662;
      const rwGeo = new THREE.BufferGeometry();
      const rwVerts = new Float32Array([
        // Left quad+gable (-2.47 to 0.50)
        -2.47, 0.03, rwZ,   0.50, 0.03, rwZ,   0.50, 4.27, rwZ,
        -2.47, 0.03, rwZ,   0.50, 4.27, rwZ,  -2.47, 2.15, rwZ,
        // Right quad+gable (0.50 to +2.47)
         0.50, 0.03, rwZ,   2.47, 0.03, rwZ,   2.47, 2.84, rwZ,
         0.50, 0.03, rwZ,   2.47, 2.84, rwZ,   0.50, 4.27, rwZ
      ]);
      rwGeo.setAttribute('position', new THREE.BufferAttribute(rwVerts, 3));
      const rwUVs = new Float32Array(12 * 2);
      for (let i = 0; i < 12; i++) {
        rwUVs[i * 2]     = (rwVerts[i * 3] + 2.5) / 1.65;
        rwUVs[i * 2 + 1] = rwVerts[i * 3 + 1] / 1.65;
      }
      rwGeo.setAttribute('uv', new THREE.BufferAttribute(rwUVs, 2));
      rwGeo.computeVertexNormals();

      const seamlessRearWall = new THREE.Mesh(rwGeo, refPlasterMat);
      seamlessRearWall.name = 'RearWall_Seamless_Int_Lining';
      seamlessRearWall.receiveShadow = true;
      seamlessRearWall.castShadow = true;
      seamlessRearWall.userData.origMaterial = refPlasterMat;
      seamlessRearWall.userData.housePartKey = 'int_wall';
      seamlessRearWall.userData.hasWorldUVs = true;
      root.add(seamlessRearWall);
      partMeshes.int_wall.push(seamlessRearWall);

      // =====================================================================
      // B. INTERIOR & ARCHITECTURAL CONTACT SHADOW DECALS (FORZA 01)
      // =====================================================================
      (function addInteriorContactShadows() {
        const cCanvas = document.createElement('canvas');
        cCanvas.width = 128;
        cCanvas.height = 128;
        const cctx = cCanvas.getContext('2d');
        const cGrad = cctx.createRadialGradient(64, 64, 10, 64, 64, 62);
        cGrad.addColorStop(0, 'rgba(15, 10, 6, 0.58)');
        cGrad.addColorStop(0.6, 'rgba(18, 12, 8, 0.26)');
        cGrad.addColorStop(1, 'rgba(18, 12, 8, 0.0)');
        cctx.fillStyle = cGrad;
        cctx.fillRect(0, 0, 128, 128);
        const contactTex = new THREE.CanvasTexture(cCanvas);
        const contactMat = new THREE.MeshBasicMaterial({
          map: contactTex,
          transparent: true,
          depthWrite: false
        });

        const shadowPads = [
          [-1.22, 0.033, -0.45, 2.35, 2.25],
          [-1.95, 0.033,  0.88, 0.65, 0.65],
          [ 2.02, 0.033, -2.45, 0.85, 1.85],
          [-2.30, 0.033, -3.24, 0.55, 0.95],
          [ 1.65, 0.033,  1.20, 1.15, 2.10],
          [-0.85, 0.033,  2.20, 1.10, 1.10]
        ];
        shadowPads.forEach(([sx, sy, sz, sw, sd]) => {
          const pad = new THREE.Mesh(new THREE.PlaneGeometry(sw, sd), contactMat);
          pad.rotation.x = -Math.PI / 2;
          pad.position.set(sx, sy, sz);
          root.add(pad);
        });
      })();
      } // end if (currentModelKey === 'forza')

      // =====================================================================
      // C. THATCHED ROOF CANOPY + OUTWARD-EXTENDING 3D STRAWS FOR ALL MODELS
      //    (Forza 01 · Tengo 26 · Kray QN)
      //    Builds a custom-fitted, 50%-balanced thatched roof canopy and
      //    thousands of outward-extending 3D straw stalks along the eaves,
      //    gables, and roof slopes of whichever model is active!
      // =====================================================================
      (function buildExtendedThatchedRoofCanopy(modelKey) {
        // High-detail Natural Sun-Dried Alang-Alang / Reed Thatch Texture + Normal Map
        const thCanvas = document.createElement('canvas');
        thCanvas.width = 512;
        thCanvas.height = 512;
        const tctx = thCanvas.getContext('2d');
        tctx.fillStyle = '#6D5337';
        tctx.fillRect(0, 0, 512, 512);

        for (let row = 0; row < 16; row++) {
          const y0 = (row / 16) * 512;
          const grad = tctx.createLinearGradient(0, y0, 0, y0 + 34);
          grad.addColorStop(0, '#3D2C1B');
          grad.addColorStop(0.22, '#7A5E3E');
          grad.addColorStop(0.75, '#8F714D');
          grad.addColorStop(1, '#523D26');
          tctx.fillStyle = grad;
          tctx.fillRect(0, y0, 512, 34);
        }
        const strawCols = ['#9C7E58', '#846744', '#634B2F', '#B0926A', '#4E3922', '#755939'];
        let rSeed = 9001;
        function trand() {
          rSeed = (rSeed * 16807) % 2147483647;
          return (rSeed - 1) / 2147483646;
        }
        for (let i = 0; i < 18000; i++) {
          const sx = trand() * 512;
          const sy = trand() * 512;
          tctx.strokeStyle = strawCols[i % strawCols.length];
          tctx.lineWidth = 1.0 + trand() * 1.3;
          tctx.beginPath();
          tctx.moveTo(sx, sy);
          tctx.lineTo(sx + (trand() - 0.5) * 4, sy + 12 + trand() * 18);
          tctx.stroke();
        }

        const thNormCanvas = document.createElement('canvas');
        thNormCanvas.width = 512;
        thNormCanvas.height = 512;
        const tnctx = thNormCanvas.getContext('2d');
        tnctx.fillStyle = 'rgb(128,128,255)';
        tnctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 12000; i++) {
          const sx = trand() * 512;
          const sy = trand() * 512;
          const nx = Math.floor(102 + trand() * 52);
          const ny = Math.floor(110 + trand() * 40);
          tnctx.strokeStyle = `rgb(${nx},${ny},245)`;
          tnctx.lineWidth = 1.5;
          tnctx.beginPath();
          tnctx.moveTo(sx, sy);
          tnctx.lineTo(sx + (trand() - 0.5) * 3, sy + 12);
          tnctx.stroke();
        }

        const thatchTex = new THREE.CanvasTexture(thCanvas);
        thatchTex.wrapS = THREE.RepeatWrapping;
        thatchTex.wrapT = THREE.RepeatWrapping;
        thatchTex.repeat.set(5, 8);
        thatchTex.colorSpace = THREE.SRGBColorSpace || 'srgb';
        thatchTex.anisotropy = maxAniso;

        const thatchNorm = new THREE.CanvasTexture(thNormCanvas);
        thatchNorm.wrapS = THREE.RepeatWrapping;
        thatchNorm.wrapT = THREE.RepeatWrapping;
        thatchNorm.repeat.set(5, 8);
        thatchNorm.anisotropy = maxAniso;

        const defaultThatchMat = new THREE.MeshStandardMaterial({
          name: 'Mat_Natural_Thatch_Overhang',
          map: thatchTex,
          normalMap: thatchNorm,
          normalScale: new THREE.Vector2(1.35, 1.35),
          roughness: 0.86,
          metalness: 0.01,
          side: THREE.DoubleSide
        });

        // Generic helper to build a 3D prism slab given a height function yFn(x, z)
        function createCustomSlopedRoofSlab(name, x0, x1, z0, z1, yOffBot, yOffTop, yFn, mat, partKey) {
          const v = [
            [x0, yFn(x0, z0) + yOffBot, z0],
            [x1, yFn(x1, z0) + yOffBot, z0],
            [x1, yFn(x1, z1) + yOffBot, z1],
            [x0, yFn(x0, z1) + yOffBot, z1],
            [x0, yFn(x0, z0) + yOffTop, z0],
            [x1, yFn(x1, z0) + yOffTop, z0],
            [x1, yFn(x1, z1) + yOffTop, z1],
            [x0, yFn(x0, z1) + yOffTop, z1]
          ];
          const quads = [
            [4, 5, 6, 7], // top
            [0, 3, 2, 1], // bottom
            [0, 1, 5, 4], // back (z0)
            [3, 7, 6, 2], // front (z1)
            [0, 4, 7, 3], // left (x0)
            [1, 2, 6, 5]  // right (x1)
          ];
          const pos = [];
          for (const [a, b, c, d] of quads) {
            pos.push(...v[a], ...v[b], ...v[c], ...v[a], ...v[c], ...v[d]);
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
          geo.computeVertexNormals();

          const mesh = new THREE.Mesh(geo, mat.clone());
          mesh.name = name;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.userData.origMaterial = mesh.material;
          ensureWorldSpaceUVs(mesh, partKey || 'ext_roof');
          if (partKey && partMeshes[partKey]) {
            mesh.userData.housePartKey = partKey;
            partMeshes[partKey].push(mesh);
          }
          root.add(mesh);
          return mesh;
        }

        const strawPositions = [];
        let sSeed = 424242;
        function srand() {
          sSeed = (sSeed * 16807) % 2147483647;
          return (sSeed - 1) / 2147483646;
        }

        function addOutwardStrawStalk(bx, by, bz, dx, dy, dz, width, droop) {
          const mx = bx + dx * 0.52;
          const my = by + dy * 0.52 - droop * 0.28;
          const mz = bz + dz * 0.52;

          const tx = bx + dx;
          const ty = by + dy - droop;
          const tz = bz + dz;

          const lenXZ = Math.hypot(dx, dz) || 1.0;
          const px = (-dz / lenXZ) * width;
          const pz = ( dx / lenXZ) * width;
          const ridgeH = width * 0.45;

          strawPositions.push(
            bx - px, by, bz - pz,
            bx, by + ridgeH, bz,
            mx, my + ridgeH * 0.7, mz,

            bx - px, by, bz - pz,
            mx, my + ridgeH * 0.7, mz,
            mx - px * 0.65, my, mz - pz * 0.65
          );
          strawPositions.push(
            bx, by + ridgeH, bz,
            bx + px, by, bz + pz,
            mx + px * 0.65, my, mz + pz * 0.65,

            bx, by + ridgeH, bz,
            mx + px * 0.65, my, mz + pz * 0.65,
            mx, my + ridgeH * 0.7, mz
          );

          strawPositions.push(
            mx - px * 0.65, my, mz - pz * 0.65,
            mx, my + ridgeH * 0.7, mz,
            tx, ty, tz,

            mx, my + ridgeH * 0.7, mz,
            mx + px * 0.65, my, mz + pz * 0.65,
            tx, ty, tz
          );
        }

        if (modelKey === 'forza') {
          // -----------------------------------------------------------------
          // 1. FORZA 01: Gable Roof (ridge along Z at X = 0.50, Y = 4.27)
          // -----------------------------------------------------------------
          const X_RIDGE = 0.50;
          const Y_RIDGE = 4.27;
          const SLOPE_L = (4.27 - 2.15) / (0.50 - (-2.47)); // 0.713805
          const SLOPE_R = (4.27 - 2.84) / (2.47 - 0.50);    // 0.725888
          const roofYAtX = (x) => x <= X_RIDGE ? Y_RIDGE - (X_RIDGE - x) * SLOPE_L : Y_RIDGE - (x - X_RIDGE) * SLOPE_R;
          const yFn = (x, _z) => roofYAtX(x);

          const Z_BACK_EXT  = -4.18;
          const Z_FRONT_EXT =  4.25;
          const X_LEFT_EXT  = -2.62;
          const X_RIGHT_EXT =  2.62;

          createCustomSlopedRoofSlab('Extended_Thatch_Roof_Left_Main',  X_LEFT_EXT, X_RIDGE + 0.03, Z_BACK_EXT, Z_FRONT_EXT, 0.02, 0.11, yFn, defaultThatchMat, 'ext_roof');
          createCustomSlopedRoofSlab('Extended_Thatch_Roof_Right_Main', X_RIDGE - 0.03, X_RIGHT_EXT, Z_BACK_EXT, Z_FRONT_EXT, 0.02, 0.11, yFn, defaultThatchMat, 'ext_roof');
          createCustomSlopedRoofSlab('Extended_Thatch_Ridge_Roll', X_RIDGE - 0.18, X_RIDGE + 0.18, Z_BACK_EXT - 0.04, Z_FRONT_EXT + 0.04, 0.09, 0.16, yFn, defaultThatchMat, 'ext_roof');

          // Left & Right Eave Straws
          const leftEdgeX = X_LEFT_EXT;
          const leftEdgeY = roofYAtX(leftEdgeX) + 0.04;
          for (let i = 0; i < 950; i++) {
            const z = (Z_BACK_EXT - 0.05) + srand() * ((Z_FRONT_EXT - Z_BACK_EXT) + 0.10);
            const layerY = (srand() - 0.35) * 0.07;
            const insetX = srand() * 0.18;
            const bx = leftEdgeX + insetX;
            const by = leftEdgeY + insetX * SLOPE_L + layerY;
            const outLen = 0.36 + srand() * 0.32;
            const splayZ = (srand() - 0.5) * 0.18;
            let cornerZBias = 0.0;
            if (z > Z_FRONT_EXT - 0.35) cornerZBias = (z - (Z_FRONT_EXT - 0.35)) * 0.65;
            if (z < Z_BACK_EXT + 0.35)  cornerZBias = (z - (Z_BACK_EXT + 0.35)) * 0.65;
            addOutwardStrawStalk(bx, by, z, -outLen, -outLen * SLOPE_L + (srand() - 0.5) * 0.05, splayZ + cornerZBias, 0.014 + srand() * 0.016, 0.05 + srand() * 0.10);
          }

          const rightEdgeX = X_RIGHT_EXT;
          const rightEdgeY = roofYAtX(rightEdgeX) + 0.04;
          for (let i = 0; i < 950; i++) {
            const z = (Z_BACK_EXT - 0.05) + srand() * ((Z_FRONT_EXT - Z_BACK_EXT) + 0.10);
            const layerY = (srand() - 0.35) * 0.07;
            const insetX = srand() * 0.18;
            const bx = rightEdgeX - insetX;
            const by = rightEdgeY + insetX * SLOPE_R + layerY;
            const outLen = 0.36 + srand() * 0.32;
            const splayZ = (srand() - 0.5) * 0.18;
            let cornerZBias = 0.0;
            if (z > Z_FRONT_EXT - 0.35) cornerZBias = (z - (Z_FRONT_EXT - 0.35)) * 0.65;
            if (z < Z_BACK_EXT + 0.35)  cornerZBias = (z - (Z_BACK_EXT + 0.35)) * 0.65;
            addOutwardStrawStalk(bx, by, z, outLen, -outLen * SLOPE_R + (srand() - 0.5) * 0.05, splayZ + cornerZBias, 0.014 + srand() * 0.016, 0.05 + srand() * 0.10);
          }

          // Front & Rear Gable Straws
          for (let i = 0; i < 680; i++) {
            const x = (X_LEFT_EXT - 0.04) + srand() * ((X_RIGHT_EXT - X_LEFT_EXT) + 0.08);
            const layerY = (srand() - 0.35) * 0.07;
            const insetZ = srand() * 0.18;
            const outLen = 0.34 + srand() * 0.30;
            const slopeSign = x <= X_RIDGE ? -1.0 : 1.0;
            const slopeVal  = x <= X_RIDGE ? SLOPE_L : SLOPE_R;
            const outwardX  = slopeSign * (0.10 + srand() * 0.16) + (srand() - 0.5) * 0.10;
            addOutwardStrawStalk(x, roofYAtX(x) + 0.05 + layerY, Z_FRONT_EXT - insetZ, outwardX, -Math.abs(outwardX) * slopeVal - (0.03 + srand() * 0.06), outLen, 0.014 + srand() * 0.016, 0.05 + srand() * 0.09);
          }
          for (let i = 0; i < 680; i++) {
            const x = (X_LEFT_EXT - 0.04) + srand() * ((X_RIGHT_EXT - X_LEFT_EXT) + 0.08);
            const layerY = (srand() - 0.35) * 0.07;
            const insetZ = srand() * 0.18;
            const outLen = 0.34 + srand() * 0.30;
            const slopeSign = x <= X_RIDGE ? -1.0 : 1.0;
            const slopeVal  = x <= X_RIDGE ? SLOPE_L : SLOPE_R;
            const outwardX  = slopeSign * (0.10 + srand() * 0.16) + (srand() - 0.5) * 0.10;
            addOutwardStrawStalk(x, roofYAtX(x) + 0.05 + layerY, Z_BACK_EXT + insetZ, outwardX, -Math.abs(outwardX) * slopeVal - (0.03 + srand() * 0.06), -outLen, 0.014 + srand() * 0.016, 0.05 + srand() * 0.09);
          }

          // Surface Thatch Courses
          [-2.05, -1.25, -0.45].forEach((txBase) => {
            for (let i = 0; i < 220; i++) {
              const z = Z_BACK_EXT + srand() * (Z_FRONT_EXT - Z_BACK_EXT);
              const bx = txBase + (srand() - 0.5) * 0.22;
              const outLen = 0.26 + srand() * 0.24;
              addOutwardStrawStalk(bx, roofYAtX(bx) + 0.09 + (srand() - 0.5) * 0.03, z, -outLen, -outLen * SLOPE_L, (srand() - 0.5) * 0.12, 0.014 + srand() * 0.014, 0.03 + srand() * 0.05);
            }
          });
          [2.05, 1.45, 0.95].forEach((txBase) => {
            for (let i = 0; i < 220; i++) {
              const z = Z_BACK_EXT + srand() * (Z_FRONT_EXT - Z_BACK_EXT);
              const bx = txBase + (srand() - 0.5) * 0.22;
              const outLen = 0.26 + srand() * 0.24;
              addOutwardStrawStalk(bx, roofYAtX(bx) + 0.09 + (srand() - 0.5) * 0.03, z, outLen, -outLen * SLOPE_R, (srand() - 0.5) * 0.12, 0.014 + srand() * 0.014, 0.03 + srand() * 0.05);
            }
          });

        } else if (modelKey === 'tengo') {
          // -----------------------------------------------------------------
          // 2. TENGO 26: Wide Gable Roof (ridge along X at Z = 1.83, Y = 3.96)
          //    Rear slope: Z = -6.10..+1.83 (Y = 2.86..3.96)
          //    Front slope: Z = +1.83..+5.50 (Y = 3.96..3.10) + Porch Z = 5.50..6.10
          // -----------------------------------------------------------------
          const Z_RIDGE = 1.83;
          const Y_RIDGE = 3.96;
          const SLOPE_BACK  = (3.96 - 2.86) / (1.83 - (-6.10)); // 0.138714
          const SLOPE_FRONT = (3.96 - 3.10) / (5.50 - 1.83);    // 0.234332
          const tengoYAtZ = (z) => z <= Z_RIDGE ? Y_RIDGE - (Z_RIDGE - z) * SLOPE_BACK : Y_RIDGE - (z - Z_RIDGE) * SLOPE_FRONT;
          const yFn = (_x, z) => tengoYAtZ(z);

          const X_LEFT = -7.55;
          const X_RIGHT = 7.55;
          const Z_BACK = -6.10;
          const Z_FRONT = 5.50;

          // 50%-Balanced Thatched Canopy Courses over Tengo's Normal Roof
          createCustomSlopedRoofSlab('Extended_Thatch_Tengo_Rear',  X_LEFT, X_RIGHT, Z_BACK, Z_RIDGE + 0.04, 0.02, 0.11, yFn, defaultThatchMat, 'ext_roof');
          createCustomSlopedRoofSlab('Extended_Thatch_Tengo_Front', X_LEFT, X_RIGHT, Z_RIDGE - 0.04, Z_FRONT, 0.02, 0.11, yFn, defaultThatchMat, 'ext_roof');
          createCustomSlopedRoofSlab('Extended_Thatch_Tengo_Porch', -1.92, -0.09, 5.46, 6.10, 0.02, 0.11, yFn, defaultThatchMat, 'ext_roof');
          createCustomSlopedRoofSlab('Extended_Thatch_Tengo_Ridge', X_LEFT - 0.04, X_RIGHT + 0.04, Z_RIDGE - 0.22, Z_RIDGE + 0.22, 0.09, 0.16, yFn, defaultThatchMat, 'ext_roof');

          // A. Front Eave Outward Straws (Z = 5.50, and Z = 6.10 over porch X in [-1.92, -0.09])
          for (let i = 0; i < 1250; i++) {
            const x = (X_LEFT - 0.05) + srand() * ((X_RIGHT - X_LEFT) + 0.10);
            const onPorch = (x >= -1.94 && x <= -0.07);
            const edgeZ = onPorch ? 6.10 : Z_FRONT;
            const insetZ = srand() * 0.20;
            const bz = edgeZ - insetZ;
            const by = tengoYAtZ(bz) + 0.05 + (srand() - 0.35) * 0.07;
            const outLen = 0.38 + srand() * 0.34;
            const splayX = (srand() - 0.5) * 0.20;
            addOutwardStrawStalk(x, by, bz, splayX, -outLen * SLOPE_FRONT + (srand() - 0.5) * 0.04, outLen, 0.015 + srand() * 0.018, 0.05 + srand() * 0.10);
          }

          // B. Rear Eave Outward Straws (Z = -6.10)
          for (let i = 0; i < 1250; i++) {
            const x = (X_LEFT - 0.05) + srand() * ((X_RIGHT - X_LEFT) + 0.10);
            const insetZ = srand() * 0.20;
            const bz = Z_BACK + insetZ;
            const by = tengoYAtZ(bz) + 0.05 + (srand() - 0.35) * 0.07;
            const outLen = 0.38 + srand() * 0.34;
            const splayX = (srand() - 0.5) * 0.20;
            addOutwardStrawStalk(x, by, bz, splayX, -outLen * SLOPE_BACK + (srand() - 0.5) * 0.04, -outLen, 0.015 + srand() * 0.018, 0.05 + srand() * 0.10);
          }

          // C. Left & Right Gable Edges (X = -7.55 and X = +7.55)
          for (let i = 0; i < 850; i++) {
            const z = Z_BACK + srand() * (Z_FRONT - Z_BACK);
            const insetX = srand() * 0.20;
            const bx = X_LEFT + insetX;
            const by = tengoYAtZ(z) + 0.05 + (srand() - 0.35) * 0.07;
            const outLen = 0.36 + srand() * 0.30;
            const slopeSign = z <= Z_RIDGE ? -1.0 : 1.0;
            const slopeVal  = z <= Z_RIDGE ? SLOPE_BACK : SLOPE_FRONT;
            const dz = slopeSign * (0.12 + srand() * 0.18);
            addOutwardStrawStalk(bx, by, z, -outLen, -Math.abs(dz) * slopeVal - 0.04, dz, 0.015 + srand() * 0.016, 0.05 + srand() * 0.09);
          }
          for (let i = 0; i < 850; i++) {
            const z = Z_BACK + srand() * (Z_FRONT - Z_BACK);
            const insetX = srand() * 0.20;
            const bx = X_RIGHT - insetX;
            const by = tengoYAtZ(z) + 0.05 + (srand() - 0.35) * 0.07;
            const outLen = 0.36 + srand() * 0.30;
            const slopeSign = z <= Z_RIDGE ? -1.0 : 1.0;
            const slopeVal  = z <= Z_RIDGE ? SLOPE_BACK : SLOPE_FRONT;
            const dz = slopeSign * (0.12 + srand() * 0.18);
            addOutwardStrawStalk(bx, by, z, outLen, -Math.abs(dz) * slopeVal - 0.04, dz, 0.015 + srand() * 0.016, 0.05 + srand() * 0.09);
          }

          // D. Surface Thatch Courses across Tengo's Front & Rear Slopes
          [-4.2, -2.2, -0.2].forEach((tzBase) => {
            for (let i = 0; i < 320; i++) {
              const x = X_LEFT + srand() * (X_RIGHT - X_LEFT);
              const bz = tzBase + (srand() - 0.5) * 0.28;
              const outLen = 0.28 + srand() * 0.26;
              addOutwardStrawStalk(x, tengoYAtZ(bz) + 0.09, bz, (srand() - 0.5) * 0.14, -outLen * SLOPE_BACK, -outLen, 0.015 + srand() * 0.015, 0.03 + srand() * 0.05);
            }
          });
          [3.0, 4.3].forEach((tzBase) => {
            for (let i = 0; i < 320; i++) {
              const x = X_LEFT + srand() * (X_RIGHT - X_LEFT);
              const bz = tzBase + (srand() - 0.5) * 0.28;
              const outLen = 0.28 + srand() * 0.26;
              addOutwardStrawStalk(x, tengoYAtZ(bz) + 0.09, bz, (srand() - 0.5) * 0.14, -outLen * SLOPE_FRONT, outLen, 0.015 + srand() * 0.015, 0.03 + srand() * 0.05);
            }
          });

        } else if (modelKey === 'kray') {
          // -----------------------------------------------------------------
          // 3. KRAY QN: Twin Opposing Sloped Pavilion Wings
          //    Back Wing:  X = -4.61..+2.85, Z = -4.48..-0.05, Y(x) = 4.86 -> 2.86
          //    Front Wing: X = -2.91..+4.61, Z = +0.05..+4.48, Y(x) = 2.84 -> 4.86
          // -----------------------------------------------------------------
          const BX0 = -4.61, BX1 = 2.85, BZ0 = -4.48, BZ1 = -0.05;
          const BY0 = 4.86,  BY1 = 2.86;
          const B_SLOPE = (BY0 - BY1) / (BX1 - BX0); // 0.268096 (slopes down toward +X)
          const krayBackY = (x, _z) => BY0 - (x - BX0) * B_SLOPE;

          const FX0 = -2.91, FX1 = 4.61, FZ0 = 0.05, FZ1 = 4.48;
          const FY0 = 2.84,  FY1 = 4.86;
          const F_SLOPE = (FY1 - FY0) / (FX1 - FX0); // 0.268617 (slopes down toward -X)
          const krayFrontY = (x, _z) => FY0 + (x - FX0) * F_SLOPE;

          // 50%-Balanced Thatched Canopy Slabs + Crest Rolls for Both Wings
          createCustomSlopedRoofSlab('Extended_Thatch_Kray_Back_Main',  BX0, BX1, BZ0, BZ1, 0.02, 0.11, krayBackY, defaultThatchMat, 'ext_roof');
          createCustomSlopedRoofSlab('Extended_Thatch_Kray_Back_Crest', BX0 - 0.03, BX0 + 0.32, BZ0 - 0.03, BZ1 + 0.03, 0.08, 0.15, krayBackY, defaultThatchMat, 'ext_roof');

          createCustomSlopedRoofSlab('Extended_Thatch_Kray_Front_Main',  FX0, FX1, FZ0, FZ1, 0.02, 0.11, krayFrontY, defaultThatchMat, 'ext_roof');
          createCustomSlopedRoofSlab('Extended_Thatch_Kray_Front_Crest', FX1 - 0.32, FX1 + 0.03, FZ0 - 0.03, FZ1 + 0.03, 0.08, 0.15, krayFrontY, defaultThatchMat, 'ext_roof');

          // Helper to populate outward straws around a Kray mono-pitch wing
          // dirSign = +1 if low eave is at x1 (Back Wing), -1 if low eave is at x0 (Front Wing)
          function addKrayWingStraws(x0, x1, z0, z1, yFn, slopeMag, dirSign) {
            // Low Eave (main outward cascade)
            const lowX = dirSign > 0 ? x1 : x0;
            for (let i = 0; i < 650; i++) {
              const z = z0 + srand() * (z1 - z0);
              const inset = srand() * 0.20;
              const bx = lowX - dirSign * inset;
              const by = yFn(bx, z) + 0.05 + (srand() - 0.35) * 0.06;
              const outLen = 0.38 + srand() * 0.34;
              addOutwardStrawStalk(bx, by, z, dirSign * outLen, -outLen * slopeMag + (srand() - 0.5) * 0.04, (srand() - 0.5) * 0.18, 0.015 + srand() * 0.016, 0.05 + srand() * 0.10);
            }
            // High Crest Eave (projecting outward from upper gable edge)
            const highX = dirSign > 0 ? x0 : x1;
            for (let i = 0; i < 520; i++) {
              const z = z0 + srand() * (z1 - z0);
              const inset = srand() * 0.18;
              const bx = highX + dirSign * inset;
              const by = yFn(bx, z) + 0.06 + (srand() - 0.35) * 0.06;
              const outLen = 0.32 + srand() * 0.28;
              addOutwardStrawStalk(bx, by, z, -dirSign * outLen, -0.04 - srand() * 0.06, (srand() - 0.5) * 0.18, 0.015 + srand() * 0.016, 0.05 + srand() * 0.09);
            }
            // Outer Z Gable Edges (z0 and z1)
            for (let i = 0; i < 650; i++) {
              const x = x0 + srand() * (x1 - x0);
              const insetZ = srand() * 0.18;
              const by = yFn(x, z0) + 0.05 + (srand() - 0.35) * 0.06;
              const outLen = 0.34 + srand() * 0.30;
              const dx = dirSign * (0.10 + srand() * 0.16);
              addOutwardStrawStalk(x, by, z0 + insetZ, dx, -Math.abs(dx) * slopeMag - 0.03, -outLen, 0.015 + srand() * 0.016, 0.05 + srand() * 0.09);
            }
            for (let i = 0; i < 650; i++) {
              const x = x0 + srand() * (x1 - x0);
              const insetZ = srand() * 0.18;
              const by = yFn(x, z1) + 0.05 + (srand() - 0.35) * 0.06;
              const outLen = 0.34 + srand() * 0.30;
              const dx = dirSign * (0.10 + srand() * 0.16);
              addOutwardStrawStalk(x, by, z1 - insetZ, dx, -Math.abs(dx) * slopeMag - 0.03, outLen, 0.015 + srand() * 0.016, 0.05 + srand() * 0.09);
            }
            // Surface Thatch Courses down the slope
            [0.25, 0.50, 0.75].forEach((frac) => {
              const txBase = x0 + (x1 - x0) * frac;
              for (let i = 0; i < 220; i++) {
                const z = z0 + srand() * (z1 - z0);
                const bx = txBase + (srand() - 0.5) * 0.25;
                const outLen = 0.26 + srand() * 0.24;
                addOutwardStrawStalk(bx, yFn(bx, z) + 0.09, z, dirSign * outLen, -outLen * slopeMag, (srand() - 0.5) * 0.14, 0.014 + srand() * 0.014, 0.03 + srand() * 0.05);
              }
            });
          }

          addKrayWingStraws(BX0, BX1, BZ0, BZ1, krayBackY, B_SLOPE, +1.0);
          addKrayWingStraws(FX0, FX1, FZ0, FZ1, krayFrontY, F_SLOPE, -1.0);
        }

        const strawGeo = new THREE.BufferGeometry();
        strawGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(strawPositions), 3));
        strawGeo.computeVertexNormals();

        const strawMesh = new THREE.Mesh(strawGeo, defaultThatchMat.clone());
        strawMesh.name = 'Extended_Thatch_Outward_Straws';
        strawMesh.castShadow = true;
        strawMesh.receiveShadow = true;
        strawMesh.userData.origMaterial = strawMesh.material;
        ensureWorldSpaceUVs(strawMesh, 'ext_roof');
        strawMesh.userData.housePartKey = 'ext_roof';
        partMeshes.ext_roof.push(strawMesh);
        root.add(strawMesh);
      })(currentModelKey);

      // Upgrade key architectural materials (Oak Floor, Wood Doors, Glass, Stone) with higher normal depth & specular polish
      root.traverse((child) => {
        if (child.isMesh && child.material) {
          const m = child.material;
          if (m.normalMap) {
            m.normalScale = new THREE.Vector2(1.45, 1.45);
          }
          if (child.name === 'empty_1000' || (m.name && m.name.includes('Oak_Floor'))) {
            m.roughness = 0.34;
            m.envMapIntensity = 1.45;
          } else if (m.name && m.name.includes('Wood')) {
            m.roughness = 0.38;
            m.envMapIntensity = 1.35;
          } else if (m.name && m.name.includes('Glass')) {
            m.transparent = true;
            m.opacity = 0.24;
            m.roughness = 0.02;
            m.metalness = 0.15;
            m.envMapIntensity = 2.6;
          }
        }
      });

      scene.add(root);
      root.updateMatrixWorld(true);
      const houseBounds = new THREE.Box3().setFromObject(root);
      const houseCenter = houseBounds.getCenter(new THREE.Vector3());
      const houseSize = houseBounds.getSize(new THREE.Vector3());
      ['front', 'aerial'].forEach(key => {
        const view = VIEWS[key];
        const direction = view.pos.clone().sub(view.target).normalize();
        const radius = houseSize.length() * .5;
        const halfFov = THREE.MathUtils.degToRad(view.fov * .5);
        const distance = radius / Math.sin(Math.min(halfFov, Math.atan(Math.tan(halfFov) * camera.aspect))) * 1.05;
        view.target.copy(houseCenter); view.pos.copy(houseCenter).addScaledVector(direction, distance);
      });
      goToView('front', true);
      if (currentModelKey === 'forza') {
        doorParts.forEach((part) => {
          doorPivot.attach(part);
        });
      }

      for (const [zone, finish] of Object.entries(okno.defaults || {})) if (finish && partMeshes[zone]?.length) applyMaterialToPart(zone, finish);
      document.body.dataset.model = okno.slug;
      document.body.dataset.loaded = 'true';
      updateSidebarUI();
      window.parent.postMessage({type:'OKNO_CONFIGURATOR_LOADED'}, location.origin);
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';
      }
    }

    function applyModelConfigMetadata(modelKey) {
      const cfg = MODEL_CONFIGS[modelKey] || MODEL_CONFIGS.forza;
      currentModelKey = cfg.key;
      BASE_MODEL_PRICE = cfg.basePrice;

      const brandEl = document.getElementById('ui-brand-title');
      if (brandEl) brandEl.textContent = cfg.title;

      const doorBtn = document.getElementById('btn-door');
      if (doorBtn) doorBtn.style.display = cfg.hasDoor ? 'inline-flex' : 'none';

      const span = cfg.shadowSpan || 12;
      sunLight.shadow.camera.left = -span;
      sunLight.shadow.camera.right = span;
      sunLight.shadow.camera.top = span;
      sunLight.shadow.camera.bottom = -span;
      sunLight.shadow.camera.updateProjectionMatrix();

      ['ext_roof', 'ext_wall', 'flooring', 'int_ceiling', 'int_wall'].forEach(pk => {
        if (cfg.areas && cfg.areas[pk]) PART_META[pk].areaSqm = cfg.areas[pk];
        if (cfg.defaults && cfg.defaults[pk]) PART_META[pk].defaultLabel = cfg.defaults[pk];
        activePartSelection[pk] = null;
        const subEl = document.querySelector(`.part-tab[data-part="${pk}"] .pt-sub`);
        if (subEl) {
          subEl.textContent = `${(window.CLADDING_CATALOG || []).filter(item => item.apps.includes(pk)).length} finishes`;
        }
      });

      Object.keys(cfg.views).forEach(vk => {
        VIEWS[vk] = { ...cfg.views[vk], pos: cfg.views[vk].pos.clone().multiplyScalar(okno.scale || 1), target: cfg.views[vk].target.clone().multiplyScalar(okno.scale || 1) };
      });
    }

    function switchModel(modelKey, isInitial = false) {
      const cfg = MODEL_CONFIGS[modelKey] || MODEL_CONFIGS.forza;
      if (!isInitial && currentModelKey === cfg.key && activeModelRoot) return;

      document.querySelectorAll('.model-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-model') === cfg.key);
      });

      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        const lBrand = overlay.querySelector('.loader-brand');
        const lSub = overlay.querySelector('.loader-sub');
        if (lBrand) lBrand.textContent = cfg.title;
        if (lSub) lSub.textContent = 'Loading experience';
        overlay.style.pointerEvents = 'auto';
        overlay.style.opacity = '1';
      }

      applyModelConfigMetadata(cfg.key);
      goToView('front', true);

      loader.load(
        cfg.url,
        (gltf) => {
          onModelLoaded(gltf);
          if (!isInitial) {
            showMaterialToast(`Loaded ${cfg.subtitle}`);
          }
        },
        (event) => {
          const bar = document.querySelector('#loading-overlay .loader-bar-fill');
          if (bar && event.total > 0) bar.style.width = Math.min(95, event.loaded / event.total * 95) + '%';
        },
        (err) => {
          console.error('House asset failed to load', err);
          window.parent.postMessage({type:'OKNO_CONFIGURATOR_ERROR'}, location.origin);
        }
      );
    }

    document.querySelectorAll('.model-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const mk = btn.getAttribute('data-model');
        if (mk) switchModel(mk, false);
      });
    });

    // Initial load of Forza 01 (with instant switching to Tengo 26 & Kray QN)
    switchModel(okno.profile, true);

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.1);

      // Smooth Camera Dolly Glide
      if (camGlide) {
        camGlide.elapsed += dt;
        const t = Math.min(1.0, camGlide.elapsed / camGlide.duration);
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        camera.position.lerpVectors(camGlide.startPos, camGlide.endPos, ease);
        const curTarget = new THREE.Vector3().lerpVectors(camGlide.startTarget, camGlide.endTarget, ease);
        camera.fov = THREE.MathUtils.lerp(camGlide.startFov, camGlide.endFov, ease);
        camera.updateProjectionMatrix();

        if (mode === 'orbit') {
          orbit.target.copy(curTarget);
          orbit.update();
        } else {
          syncYawPitchFromTarget(camera.position, curTarget);
          applyWalkCameraRotation();
        }

        if (t >= 1.0) camGlide = null;
      } else if (mode === 'walk') {
        const speed = (keys['ShiftLeft'] || keys['ShiftRight']) ? 5.5 : 2.8;
        const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
        const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

        const move = new THREE.Vector3();
        if (keys['KeyW'] || keys['ArrowUp']) move.add(forward);
        if (keys['KeyS'] || keys['ArrowDown']) move.sub(forward);
        if (keys['KeyD'] || keys['ArrowRight']) move.add(right);
        if (keys['KeyA'] || keys['ArrowLeft']) move.sub(right);

        if (move.lengthSq() > 0) {
          move.normalize().multiplyScalar(speed * dt);
          camera.position.add(move);

          const x = camera.position.x;
          const z = camera.position.z;
          const onHouseOrPorch = (x >= -2.55 && x <= 2.55 && z >= -3.60 && z <= 5.35);
          const targetEyeY = onHouseOrPorch ? 1.56 : 1.15;
          if (!keys['KeyQ'] && !keys['KeyE']) {
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetEyeY, 6.0 * dt);
          }

          const distToDoor = Math.hypot(x - (-0.62), z - 3.54);
          if (distToDoor < 2.6) {
            doorOpenTarget = 1.0;
          } else if (!manualDoorOverride && distToDoor > 4.2) {
            doorOpenTarget = 0.0;
          }
        }
        if (keys['KeyE'] || keys['Space']) camera.position.y += speed * 0.7 * dt;
        if (keys['KeyQ'] || keys['ControlLeft']) camera.position.y -= speed * 0.7 * dt;
      } else {
        orbit.update();
      }

      doorOpenCurrent = THREE.MathUtils.lerp(doorOpenCurrent, doorOpenTarget, 5.5 * dt);
      doorPivot.rotation.y = -doorOpenCurrent * THREE.MathUtils.degToRad(84);

      renderWithPhotorealPostProcessing();
    }

    // =========================================================================
    // REAL-TIME WEBGL2 POST-PROCESSING SHADER PIPELINE
    // (Screen-Space Ambient Occlusion + Specular Bloom + Contrast-Adaptive Sharpening)
    // =========================================================================
    let postRT = null;
    let postQuadScene = null;
    let postQuadCam = null;
    let postQuadMat = null;

    function initPhotorealPostProcessing() {
      const dpr = Math.min(window.devicePixelRatio || 1, isMobileDevice ? 1.5 : 2.0);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);

      if (!THREE.DepthTexture) return;
      const depthTex = new THREE.DepthTexture(w, h);
      depthTex.type = THREE.UnsignedIntType || THREE.UnsignedShortType;

      postRT = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        depthBuffer: true,
        depthTexture: depthTex
      });

      postQuadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      postQuadScene = new THREE.Scene();

      postQuadMat = new THREE.ShaderMaterial({
        uniforms: {
          tColor:     { value: postRT.texture },
          tDepth:     { value: depthTex },
          resolution: { value: new THREE.Vector2(w, h) },
          cameraNear: { value: camera.near },
          cameraFar:  { value: camera.far }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tColor;
          uniform sampler2D tDepth;
          uniform vec2 resolution;
          uniform float cameraNear;
          uniform float cameraFar;
          varying vec2 vUv;

          float getLinearDepth(vec2 coord) {
            float z = texture2D(tDepth, coord).x;
            float viewZ = (cameraNear * cameraFar) / ((cameraFar - cameraNear) * z - cameraFar);
            return -viewZ;
          }

          void main() {
            vec2 texel = 1.0 / resolution;
            vec3 centerCol = texture2D(tColor, vUv).rgb;

            // 1. Contrast-Adaptive Micro-Sharpening (CAS) for crisp wood grain & stone pores
            vec3 n = texture2D(tColor, vUv + vec2(0.0, texel.y)).rgb;
            vec3 s = texture2D(tColor, vUv - vec2(0.0, texel.y)).rgb;
            vec3 e = texture2D(tColor, vUv + vec2(texel.x, 0.0)).rgb;
            vec3 w = texture2D(tColor, vUv - vec2(texel.x, 0.0)).rgb;
            vec3 blurCross = 0.25 * (n + s + e + w);
            vec3 sharpened = centerCol + (centerCol - blurCross) * 0.28;

            // 2. Multi-Radius Screen-Space Ambient Occlusion (SSAO) for architectural crevices & rafters
            float dCenter = getLinearDepth(vUv);
            float occ = 0.0;
            if (dCenter < 45.0) {
              vec2 offsets[8];
              offsets[0] = vec2( 1.0,  0.0);
              offsets[1] = vec2(-1.0,  0.0);
              offsets[2] = vec2( 0.0,  1.0);
              offsets[3] = vec2( 0.0, -1.0);
              offsets[4] = vec2( 0.707,  0.707);
              offsets[5] = vec2(-0.707,  0.707);
              offsets[6] = vec2( 0.707, -0.707);
              offsets[7] = vec2(-0.707, -0.707);

              float radiusPx = clamp(14.0 / max(dCenter, 0.8), 2.0, 12.0);
              for (int i = 0; i < 8; i++) {
                float dSample1 = getLinearDepth(vUv + offsets[i] * texel * radiusPx);
                float dSample2 = getLinearDepth(vUv + offsets[i] * texel * (radiusPx * 2.2));
                float diff1 = dCenter - dSample1;
                float diff2 = dCenter - dSample2;
                if (diff1 > 0.008 && diff1 < 0.38) {
                  occ += smoothstep(0.008, 0.12, diff1) * (1.0 - smoothstep(0.18, 0.38, diff1));
                }
                if (diff2 > 0.015 && diff2 < 0.65) {
                  occ += 0.65 * smoothstep(0.015, 0.18, diff2) * (1.0 - smoothstep(0.30, 0.65, diff2));
                }
              }
              occ = clamp(occ / 9.5, 0.0, 0.42);
            }

            // Apply warm architectural ambient occlusion into creases
            vec3 aoTint = mix(vec3(1.0), vec3(0.16, 0.12, 0.09), occ);
            vec3 col = sharpened * aoTint;

            // 3. Subtle Warm Specular Glint / Bloom
            vec3 b1 = texture2D(tColor, vUv + texel * vec2( 3.5,  3.5)).rgb;
            vec3 b2 = texture2D(tColor, vUv + texel * vec2(-3.5,  3.5)).rgb;
            vec3 b3 = texture2D(tColor, vUv + texel * vec2( 3.5, -3.5)).rgb;
            vec3 b4 = texture2D(tColor, vUv + texel * vec2(-3.5, -3.5)).rgb;
            vec3 bloomAvg = 0.25 * (b1 + b2 + b3 + b4);
            float lum = dot(bloomAvg, vec3(0.299, 0.587, 0.114));
            col += max(bloomAvg - vec3(0.78), vec3(0.0)) * 0.18 * smoothstep(0.75, 1.15, lum);

            // 4. Subtle Optical Vignette
            float distFromCenter = length(vUv - 0.5);
            col *= (1.0 - smoothstep(0.45, 0.92, distFromCenter) * 0.10);

            gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
          }
        `,
        depthWrite: false,
        depthTest: false
      });

      const quadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postQuadMat);
      postQuadScene.add(quadMesh);
    }

    initPhotorealPostProcessing();

    function renderWithPhotorealPostProcessing() {
      if (postRT && postQuadScene && postQuadCam) {
        renderer.setRenderTarget(postRT);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(postQuadScene, postQuadCam);
      } else {
        renderer.render(scene, camera);
      }
    }

    // Live Blender integration is not part of the hosted browser viewer.
    animate();

    function fitAvailableViewport() {
      const open = !document.body.classList.contains('sidebar-collapsed');
      const mobile = window.innerWidth <= 860;
      const panel = document.getElementById('cladding-sidebar').getBoundingClientRect();
      const width = Math.max(1, open && !mobile ? panel.left : window.innerWidth);
      const height = Math.max(1, open && mobile ? panel.top : window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      renderer.setPixelRatio(dpr); renderer.setSize(width, height);
      camera.aspect = width / height; camera.updateProjectionMatrix();
      if (postRT && postQuadMat) { postRT.setSize(Math.floor(width*dpr), Math.floor(height*dpr)); postQuadMat.uniforms.resolution.value.set(width*dpr, height*dpr); }
    }
    fitAvailableViewport();
    window.addEventListener('resize', fitAvailableViewport);
    new MutationObserver(fitAvailableViewport).observe(document.body, {attributes:true, attributeFilter:['class']});

  
})().catch(error => { console.error(error); window.parent.postMessage({type:"OKNO_CONFIGURATOR_ERROR"}, location.origin); });
