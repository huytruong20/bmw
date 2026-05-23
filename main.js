import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadCarModel } from './car-model.js';

// --- DOM ---
const container = document.getElementById('canvas-container');
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.getElementById('loading-progress');
const infoPanel = document.getElementById('info-panel');
const partNameEl = document.getElementById('part-name');
const partDescEl = document.getElementById('part-desc');
const partSpecsEl = document.getElementById('part-specs');

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(7, 3, 7);
camera.lookAt(0, 0.8, 0);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// --- CSS2D Label Renderer ---
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
container.appendChild(labelRenderer.domElement);

// --- Post-processing (subtle bloom, no glare) ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
    0.15, 0.3, 0.95
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// --- Environment ---
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envTexture;
pmremGenerator.dispose();

// --- Lighting (balanced, no glare on white) ---
const ambientLight = new THREE.AmbientLight(0x667788, 0.8);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xccddee, 0x222244, 0.6);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.position.set(5, 12, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 30;
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xbbccdd, 0.6);
fillLight.position.set(-6, 6, -5);
scene.add(fillLight);

const topLight = new THREE.SpotLight(0xffffff, 1.2);
topLight.position.set(0, 18, 0);
topLight.angle = Math.PI / 4;
topLight.penumbra = 0.7;
topLight.castShadow = true;
topLight.shadow.mapSize.set(1024, 1024);
scene.add(topLight);

const rimLight = new THREE.DirectionalLight(0x3366aa, 0.3);
rimLight.position.set(-4, 2, 8);
scene.add(rimLight);

const backLight = new THREE.DirectionalLight(0xddeeff, 0.5);
backLight.position.set(-7, 5, -4);
scene.add(backLight);

// --- Ground (reflective showroom floor) ---
const groundGeo = new THREE.PlaneGeometry(50, 50);
const groundMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e1e3a,
    roughness: 0.25,
    metalness: 0.6,
    reflectivity: 0.8,
    clearcoat: 0.3,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
scene.add(ground);

// Grid overlay
const gridCanvas = document.createElement('canvas');
gridCanvas.width = 512;
gridCanvas.height = 512;
const gridCtx = gridCanvas.getContext('2d');
gridCtx.strokeStyle = 'rgba(100,140,220,0.06)';
gridCtx.lineWidth = 1;
for (let i = 0; i <= 512; i += 32) {
    gridCtx.beginPath(); gridCtx.moveTo(i, 0); gridCtx.lineTo(i, 512); gridCtx.stroke();
    gridCtx.beginPath(); gridCtx.moveTo(0, i); gridCtx.lineTo(512, i); gridCtx.stroke();
}
const gridTexture = new THREE.CanvasTexture(gridCanvas);
gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping;
gridTexture.repeat.set(6, 6);
const gridPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshBasicMaterial({ map: gridTexture, transparent: true, depthWrite: false })
);
gridPlane.rotation.x = -Math.PI / 2;
gridPlane.position.y = 0.001;
scene.add(gridPlane);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;
controls.target.set(0, 0.8, 0);

// --- State ---
let carData = null;
let hoveredPart = null;
let lastRaycastTime = 0;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-1, -1);
const ACCENT_COLOR = new THREE.Color(0x1c69d4);

// --- Interaction (hover only, no explosion) ---
function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onTouchStart(e) {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
}

window.addEventListener('mousemove', onMouseMove, { passive: true });
window.addEventListener('touchstart', onTouchStart, { passive: true });

function findPartFromObject(obj) {
    let current = obj;
    while (current) {
        if (current.userData && current.userData.partId) {
            return current.userData.partId;
        }
        current = current.parent;
    }
    return null;
}

function doRaycast() {
    if (!carData) return;

    raycaster.setFromCamera(mouse, camera);

    const meshes = [];
    carData.parts.forEach(part => {
        part.mesh.traverse(child => {
            if (child.isMesh) meshes.push(child);
        });
    });

    const intersects = raycaster.intersectObjects(meshes, false);

    let newHovered = null;
    if (intersects.length > 0) {
        const partId = findPartFromObject(intersects[0].object);
        if (partId && carData.parts.has(partId)) {
            newHovered = partId;
        }
    }

    if (newHovered !== hoveredPart) {
        if (hoveredPart && carData.parts.has(hoveredPart)) {
            const prev = carData.parts.get(hoveredPart);
            if (prev.labelDiv) prev.labelDiv.classList.remove('visible');
        }

        hoveredPart = newHovered;

        if (hoveredPart && carData.parts.has(hoveredPart)) {
            const part = carData.parts.get(hoveredPart);
            if (part.labelDiv) part.labelDiv.classList.add('visible');
            partNameEl.textContent = part.label;
            partDescEl.textContent = part.description;
            partSpecsEl.textContent = part.specs;
            infoPanel.classList.add('visible');
            document.body.classList.add('hovering-part');
        } else {
            infoPanel.classList.remove('visible');
            document.body.classList.remove('hovering-part');
        }
    }
}

// --- Highlights ---
function updateHighlights() {
    if (!carData) return;

    carData.parts.forEach((part, name) => {
        const isHovered = name === hoveredPart;
        const target = isHovered ? 1 : 0;
        part.highlightIntensity += (target - part.highlightIntensity) * 0.1;

        part.materials.forEach(m => {
            if (!m._origEmissive) {
                m._origEmissive = m.emissive ? m.emissive.clone() : new THREE.Color(0x000000);
                m._origEmissiveIntensity = m.emissiveIntensity || 0;
            }

            if (part.highlightIntensity > 0.01) {
                m.emissive.lerpColors(m._origEmissive, ACCENT_COLOR, part.highlightIntensity);
                m.emissiveIntensity = m._origEmissiveIntensity + part.highlightIntensity * 0.4;
            } else {
                m.emissive.copy(m._origEmissive);
                m.emissiveIntensity = m._origEmissiveIntensity;
            }
        });
    });
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    if (now - lastRaycastTime > 50) {
        doRaycast();
        lastRaycastTime = now;
    }

    updateHighlights();
    controls.update();
    composer.render();
    labelRenderer.render(scene, camera);
}

// --- Resize ---
function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.resolution.set(w / 2, h / 2);
}

window.addEventListener('resize', onResize);

// --- Load Model and Start ---
async function init() {
    try {
        const loaderBarFill = document.getElementById('loader-bar-fill');
        carData = await loadCarModel((progress) => {
            const pct = Math.round(progress * 100);
            if (loadingProgress) {
                loadingProgress.textContent = `${pct}%`;
            }
            if (loaderBarFill) {
                loaderBarFill.style.width = `${pct}%`;
            }
        });

        scene.add(carData.group);

        // Create CSS2D labels for each part
        carData.parts.forEach((part) => {
            const labelDiv = document.createElement('div');
            labelDiv.className = 'part-label';
            labelDiv.textContent = part.label;
            const labelObj = new CSS2DObject(labelDiv);

            const partBbox = new THREE.Box3().setFromObject(part.mesh);
            const partCenter = partBbox.getCenter(new THREE.Vector3());
            const partSize = partBbox.getSize(new THREE.Vector3());

            const localCenter = part.mesh.worldToLocal(partCenter.clone());
            labelObj.position.copy(localCenter);
            labelObj.position.y += partSize.y * 0.6;

            part.mesh.add(labelObj);
            part.labelDiv = labelDiv;
            part.labelObj = labelObj;
        });

        // Hide loading screen
        loadingScreen.classList.add('loaded');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);

        animate();

    } catch (error) {
        console.error('Failed to load car model:', error);
        if (loadingProgress) {
            loadingProgress.textContent = 'Error loading model';
            loadingProgress.style.color = '#ff4444';
        }
    }
}

init();
