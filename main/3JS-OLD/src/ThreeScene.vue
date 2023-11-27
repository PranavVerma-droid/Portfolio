<template>
    <div ref="threeContainer"></div>
</template>

<script>
import { onMounted, ref } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default {

    data() {
        return {
            rotatingFerry: null
        };
    },
    beforeCreate() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
    },
    mounted() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff); // Set background color to white


        let width = window.innerWidth / 10; // divide by a larger number to make the scene appear larger
        let height = window.innerHeight / 10;
        this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 5000);
        this.camera.position.z = 2;
        this.camera.position.x = 1.5; // Move the camera 5 units to the right
        this.camera.position.y = 0; // Move the camera 5 units up
        this.camera.lookAt(this.scene.position);
        this.camera.zoom = 5; // Zoom in
        this.camera.updateProjectionMatrix(); // Update the camera's projection matrix

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio * 2);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.shadowMap.enabled = true;

        this.composer = new EffectComposer(this.renderer);
        let renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        this.composer.addPass(bloomPass);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = true;


        let sunLight = new THREE.DirectionalLight(0xffffff, 2);
        sunLight.castShadow = true;
        sunLight.shadow.camera.far = 20;
        sunLight.shadow.mapSize.set(2048, 2048);
        sunLight.shadow.normalBias = 0.05;
        sunLight.position.set(8, 8, 8);
        this.scene.add(sunLight);

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const loader = new GLTFLoader();
        loader.load(
            './environment.gltf', // Replace with the path to your model
            (gltf) => {
                gltf.scene.scale.set(1, 1, 1);
                gltf.scene.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });
                this.scene.add(gltf.scene);
                const ferry = gltf.scene.getObjectByName('Rotating_Ferry');
                if (ferry) {
                    this.rotatingFerry = ferry;
                    this.rotatingFerry.rotation.x += 0.01;
                }

                gltf.scene.traverse((object) => {
                    if (object.name === 'Lantern_pole') {
                        // Create a point light
                        const light = new THREE.PointLight(0xffffff, 2, 100);

                        // Position the light at the same position as the lantern pole
                        light.position.copy(object.position);

                        // Add the light to the scene
                        this.scene.add(light);
                    }
                });
            },
            undefined,
            (error) => {
                console.error(error);
            }
        );

        this.animate();
    },
    methods: {
        animate() {
            requestAnimationFrame(this.animate);
            this.composer.render();
            this.controls.update();
            if (this.rotatingFerry) {
                this.rotatingFerry.rotation.x += 0.01;
            }
            this.renderer.render(this.scene, this.camera);
        }
    }
};

</script>