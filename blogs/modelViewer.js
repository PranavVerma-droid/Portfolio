class ModelViewer {
    constructor() {
        this.container = document.getElementById('model-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.loader = new THREE.GLTFLoader();
        
        this.isUserInteracting = false;
        this.rotationSpeed = 0.002;
        this.targetRotation = 0;
        this.autoRotationTimeout = null;
        this.previousMouseX = 0;

        this.init();
        this.setupLights();
        this.setupPostProcessing();
        this.loadModel();
        this.animate();
        this.setupResizeHandler();
        this.setupInteractionHandlers();
    }

    init() {
        //setup viewport + basic settings.
        const viewportHeight = Math.min(window.innerWidth * 0.8, 1000);
        this.renderer.setSize(window.innerWidth, viewportHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.powerPreference = "high-performance";
        this.renderer.capabilities.logarithmicDepthBuffer = true;

        // anti-aliasing
        this.renderer.antialias = true;
        this.container.appendChild(this.renderer.domElement);

        // camera positioning
        this.camera.position.set(25, 20, 25);
        this.camera.lookAt(0, 2, 0);
    }

    setupLights() {
        // Ambient Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(ambientLight);

        // Key Lighting
        const mainLight = new THREE.DirectionalLight(0xffffff, 2.7); 
        mainLight.position.set(10, 20, 15);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 500;
        this.scene.add(mainLight);

        // Hemisphere Lighting
        const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x080820, 1.2);
        this.scene.add(hemiLight);

        // Point Lighting
        const pointLight = new THREE.PointLight(0xffefd5, 2.7, 100);
        pointLight.position.set(15, 25, 15);
        
        // Rim Lighting
        const rimLight = new THREE.DirectionalLight(0xffffff, 1);
        rimLight.position.set(-5, 10, -10);
        this.scene.add(rimLight);
        
        // Orb Lighting
        const sphereGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.6
        });


        this.lightSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.lightSphere.position.copy(pointLight.position);
        
        this.scene.add(pointLight);
        this.scene.add(this.lightSphere);
    }

    async loadModel() {
        try {
            const gltf = await new Promise((resolve, reject) => {
                this.loader.load(
                    'model/island-2.glb',
                    resolve,
                    undefined,
                    reject
                );
            });

            const model = gltf.scene;

            const modelHeight = 8.5; 

            model.scale.set(7.5, 7.5, 7.5);
            model.position.y = modelHeight;

            // clip the model to size
            const radius = 7;
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    if (child.material) {
                        child.material = child.material.clone();
                        
                        child.material.transparent = true;
                        child.material.needsUpdate = true;
                        // roughness
                        child.material.roughness = 0.45;  
                        // metalness
                        child.material.metalness = 0.35; 
                        // real-ness ig
                        child.material.envMapIntensity = 1.2;
                        
                        if (child.material.color) {
                            const baseColor = child.material.color.clone();
                            child.material.emissive = baseColor;
                            child.material.emissiveIntensity = 0.1;
                        }

                        child.material.onBeforeCompile = (shader) => {
                            shader.uniforms.radius = { value: radius };
                            shader.uniforms.fadeWidth = { value: 2.0 };

                            shader.vertexShader = `
                                varying vec3 vWorldPosition;
                                ${shader.vertexShader.replace(
                                    '#include <begin_vertex>',
                                    `#include <begin_vertex>
                                    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
                                )}
                            `;

                            shader.fragmentShader = `
                                uniform float radius;
                                uniform float fadeWidth;
                                varying vec3 vWorldPosition;
                                ${shader.fragmentShader.replace(
                                    '#include <clipping_planes_fragment>',
                                    `#include <clipping_planes_fragment>
                                    float dist = sqrt(vWorldPosition.x * vWorldPosition.x + vWorldPosition.z * vWorldPosition.z);
                                    float circle = 1.0 - smoothstep(radius - fadeWidth, radius, dist);
                                    if (circle < 0.01) discard;
                                    gl_FragColor.a *= circle;`
                                )}
                            `;
                        };

                        if (child.material.normalMap) {
                            child.material.normalScale.set(1.8, 1.8);
                            child.material.normalMap.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                        }

                        if (child.material.map) {
                            child.material.map.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                            child.material.map.generateMipmaps = true;
                            child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                            child.material.map.magFilter = THREE.LinearFilter;
                        }
                    }
                }
            });

            const glowGeometry = new THREE.CircleGeometry(radius, 64);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x4a9eff,
                transparent: true,
                opacity: 0.08,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            const glowCircle = new THREE.Mesh(glowGeometry, glowMaterial);
            glowCircle.rotation.x = -Math.PI / 2;
            glowCircle.position.y = modelHeight - 4;

            const group = new THREE.Group();
            group.add(model);
            group.add(glowCircle);

            this.scene.add(group);
            this.model = group;

            this.scene.fog = new THREE.Fog(0x000000, 25, 50);
        } catch (error) {
            console.error('Error loading model:', error);
        }
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        if (this.model && !this.isUserInteracting) {
            this.model.rotation.y += this.rotationSpeed;
        }

        if (this.lightSphere) {
            const time = Date.now() * 0.001;
            const radius = 20;
            const height = 25;
            
            this.lightSphere.position.x = Math.cos(time * 0.5) * radius;
            this.lightSphere.position.z = Math.sin(time * 0.5) * radius;
            this.lightSphere.position.y = height + Math.sin(time) * 2;
            
            const pointLight = this.scene.children.find(child => child.type === 'PointLight');
            if (pointLight) {
                pointLight.position.copy(this.lightSphere.position);
            }
        }

        if (this.composer) {
            this.composer.render();
        }
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            const newWidth = window.innerWidth;
            const newHeight = Math.min(window.innerWidth * 0.8, 1000);
            
            this.camera.aspect = newWidth / newHeight;
            this.camera.updateProjectionMatrix();
            
            this.renderer.setSize(newWidth, newHeight);
            
            if (this.composer) {
                this.composer.setSize(newWidth, newHeight);
                
                const fxaaPass = this.composer.passes.find(pass => pass.material?.uniforms?.resolution);
                if (fxaaPass) {
                    const pixelRatio = this.renderer.getPixelRatio();
                    fxaaPass.material.uniforms.resolution.value.x = 1 / (newWidth * pixelRatio);
                    fxaaPass.material.uniforms.resolution.value.y = 1 / (newHeight * pixelRatio);
                }
            }
        });
    }

    setupPostProcessing() {
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        renderPass.clearAlpha = 0;
        this.composer.addPass(renderPass);

        // SMAA Pass for better anti-aliasing
        const smaaPass = new THREE.SMAAPass(
            window.innerWidth * this.renderer.getPixelRatio(),
            window.innerHeight * this.renderer.getPixelRatio()
        );
        this.composer.addPass(smaaPass);

        // FXAA Pass with optimized settings
        const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
        const pixelRatio = this.renderer.getPixelRatio();
        fxaaPass.material.uniforms.resolution.value.x = 1 / (window.innerWidth * pixelRatio * 1.5);
        fxaaPass.material.uniforms.resolution.value.y = 1 / (window.innerHeight * pixelRatio * 1.5);
        this.composer.addPass(fxaaPass);
    }

    setupInteractionHandlers() {
        this.container.addEventListener('mousedown', this.onDragStart);
        this.container.addEventListener('touchstart', this.onDragStart);
        window.addEventListener('mousemove', this.onDragMove);
        window.addEventListener('touchmove', this.onDragMove);
        window.addEventListener('mouseup', this.onDragEnd);
        window.addEventListener('touchend', this.onDragEnd);
    }

    onDragStart = (event) => {
        this.isUserInteracting = true;
        this.previousMouseX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX;
        if (this.autoRotationTimeout) {
            clearTimeout(this.autoRotationTimeout);
        }
    }

    onDragMove = (event) => {
        if (!this.isUserInteracting) return;
        
        const currentX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX;
        const delta = (currentX - this.previousMouseX) * 0.005;
        
        if (this.model) {
            this.model.rotation.y += delta;
            this.targetRotation = this.model.rotation.y;
        }
        
        this.previousMouseX = currentX;
    }

    onDragEnd = () => {
        this.isUserInteracting = false;
        this.autoRotationTimeout = setTimeout(() => {
            this.rotationSpeed = 0.002;
        }, 1000);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new ModelViewer();
});
