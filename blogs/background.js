class ParticleBackground {
    constructor() {
        this.container = document.getElementById('three-background');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.particles = [];
        this.isDarkMode = document.body.classList.contains('dark-mode');

        this.init();
        this.animate();
        this.setupResizeHandler();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 50;

        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        const particleTexture = new THREE.TextureLoader().load('data:image/png;base64,' + this.generateCircleTexture());

        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * 100 - 50;
            const y = Math.random() * 100 - 50;
            const z = Math.random() * 50 - 25;
            positions.push(x, y, z);

            const color = this.isDarkMode ? 
                new THREE.Color(0x4a9eff) : 
                new THREE.Color(0x2d7fdb);
            colors.push(color.r, color.g, color.b);

            this.particles.push({
                velocity: new THREE.Vector3(
                    Math.random() * 0.02 - 0.01,
                    Math.random() * 0.02 - 0.01,
                    Math.random() * 0.02 - 0.01
                ),
                position: new THREE.Vector3(x, y, z)
            });
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            map: particleTexture,
            alphaTest: 0.1
        });

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);
    }

    generateCircleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        ctx.arc(32, 32, 28, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        return canvas.toDataURL().split(',')[1];
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        const positions = this.points.geometry.attributes.position.array;

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const i3 = i * 3;

            particle.position.add(particle.velocity);

            ['x', 'y', 'z'].forEach((axis, j) => {
                if (Math.abs(particle.position[axis]) > 50) {
                    particle.velocity[axis] *= -1;
                }
                positions[i3 + j] = particle.position[axis];
            });
        }

        this.points.geometry.attributes.position.needsUpdate = true;
        this.points.rotation.x += 0.0003;
        this.points.rotation.y += 0.0005;

        this.renderer.render(this.scene, this.camera);
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateTheme(isDark) {
        this.isDarkMode = isDark;
        const colors = [];
        const color = isDark ? 
            new THREE.Color(0x4a9eff) : 
            new THREE.Color(0x2d7fdb);

        for (let i = 0; i < this.particles.length; i++) {
            colors.push(color.r, color.g, color.b);
        }

        this.points.geometry.setAttribute('color', 
            new THREE.Float32BufferAttribute(colors, 3));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const background = new ParticleBackground();
    
    document.body.addEventListener('themeChange', (e) => {
        background.updateTheme(e.detail.isDark);
    });
});
