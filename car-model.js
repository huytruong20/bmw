import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const PART_LABELS = {
    'body': { label: 'Body Shell', desc: 'High-strength steel and aluminum monocoque body structure with advanced crumple zones and reinforced passenger cell.', specs: 'Material: Steel + Aluminum | Torsional rigidity: 38,000 Nm/deg' },
    'hood': { label: 'Hood', desc: 'Aluminum hood panel with power dome sculpting and pedestrian safety deformation zones.', specs: 'Material: Aluminum | Weight: 11.5 kg' },
    'bonnet': { label: 'Hood', desc: 'Aluminum hood panel with power dome sculpting and pedestrian safety deformation zones.', specs: 'Material: Aluminum | Weight: 11.5 kg' },
    'trunk': { label: 'Trunk Lid', desc: 'Power-operated trunk lid with soft-close mechanism. 440L boot capacity.', specs: 'Capacity: 440L | Power-operated' },
    'boot': { label: 'Trunk Lid', desc: 'Power-operated trunk lid with soft-close mechanism. 440L boot capacity.', specs: 'Capacity: 440L | Power-operated' },
    'door': { label: 'Door Assembly', desc: 'Lightweight door with integrated side-impact protection beams. Comfort Access keyless entry with electronic soft-close.', specs: 'Material: Aluminum + Steel' },
    'bumper': { label: 'Bumper Assembly', desc: 'Sport bumper with integrated sensors, air curtains and aerodynamic elements.', specs: 'Includes: PDC sensors, Air curtains' },
    'fender': { label: 'Fender Panel', desc: 'Pressed aluminum fender panel with precise panel gap engineering.', specs: 'Material: Aluminum' },
    'wheel': { label: 'M Sport Wheel', desc: '19" M Sport double-spoke alloy wheels with performance tires and M Compound brakes.', specs: 'Size: 19" | Tire: 255/35 R19' },
    'tire': { label: 'Performance Tire', desc: 'Michelin Pilot Sport 4S performance tires engineered for maximum grip.', specs: 'Size: 255/35 R19 | Rating: Y' },
    'rim': { label: 'Alloy Wheel Rim', desc: 'Forged M Sport alloy rim with machine-polished face.', specs: 'Size: 19" | Style: 797M' },
    'mirror': { label: 'Side Mirror', desc: 'Power-folding heated mirror with auto-dimming and integrated turn signal.', specs: 'Features: Auto-dim, Heated, Power-fold' },
    'light': { label: 'Lighting Unit', desc: 'Full LED adaptive lighting with dynamic cornering function.', specs: 'Type: Full LED Adaptive' },
    'headlight': { label: 'Adaptive LED Headlight', desc: 'Full LED headlights with Selective Beam non-dazzling high beam and iconic DRL signature.', specs: 'Type: LED Adaptive | Range: 300m' },
    'tail': { label: 'LED Taillight', desc: '3D full-LED taillights with L-shaped light signature and dynamic turn indicators.', specs: 'Type: Full LED | Dynamic indicators' },
    'grill': { label: 'Kidney Grille', desc: 'Signature BMW kidney grille with active air flap control for aerodynamic and cooling optimization.', specs: 'Type: Active Air Flap' },
    'grille': { label: 'Kidney Grille', desc: 'Signature BMW kidney grille with active air flap control for aerodynamic and cooling optimization.', specs: 'Type: Active Air Flap' },
    'engine': { label: 'S58 Twin-Turbo Engine', desc: 'BMW S58 3.0L inline-6 twin-turbocharged engine. 503 hp and 479 lb-ft of torque with Competition package.', specs: '503 HP @ 6,250 rpm | 479 lb-ft | 0-60: 3.8s' },
    'exhaust': { label: 'M Performance Exhaust', desc: 'Active valve-controlled sport exhaust system with quad tips. Variable backpressure for signature M sound.', specs: 'Material: Titanium | Quad tips' },
    'windshield': { label: 'Windshield', desc: 'Acoustic laminated safety glass with infrared coating, rain sensor, and HUD projection area.', specs: 'Type: Acoustic Laminated | HUD Ready' },
    'glass': { label: 'Glass Panel', desc: 'Automotive-grade tempered safety glass with UV protection coating.', specs: 'Type: Tempered Safety Glass' },
    'window': { label: 'Window Glass', desc: 'Frameless tempered glass with UV protection and acoustic insulation properties.', specs: 'Type: Tempered Safety Glass' },
    'roof': { label: 'Roof Panel', desc: 'Carbon fiber roof panel reducing center of gravity for enhanced dynamics.', specs: 'Material: CFRP | Weight: 6 kg' },
    'seat': { label: 'M Sport Seat', desc: 'M Sport seats with integrated headrests, 14-way power adjustment, memory, and lumbar support.', specs: 'Adjustment: 14-way power | Memory' },
    'interior': { label: 'Interior Trim', desc: 'Premium interior with BMW Live Cockpit Professional and iDrive 7.0.', specs: 'Display: 12.3" + 10.25" | iDrive 7.0' },
    'dashboard': { label: 'Dashboard', desc: 'Driver-focused cockpit design with BMW Live Cockpit Professional digital instrument cluster.', specs: 'Display: 12.3" digital cluster' },
    'steering': { label: 'M Steering Wheel', desc: 'M leather steering wheel with shift paddles, multifunction buttons, and heating.', specs: 'Features: Shift paddles, Heated' },
    'suspension': { label: 'Adaptive M Suspension', desc: 'Electronically controlled dampers with Comfort, Sport, and Sport+ modes.', specs: 'Type: Adaptive M | 3 Modes' },
    'brake': { label: 'M Compound Brakes', desc: 'M Compound brakes with 6-piston front calipers and 380mm ventilated discs.', specs: 'Front: 380mm | 6-piston calipers' },
    'diffuser': { label: 'Rear Diffuser', desc: 'Functional carbon fiber rear diffuser for improved downforce and air extraction.', specs: 'Material: CFRP | Functional aero' },
    'spoiler': { label: 'Rear Spoiler', desc: 'Integrated M Performance lip spoiler for additional rear downforce at high speed.', specs: 'Type: Fixed lip | Material: CFRP' },
    'splitter': { label: 'Front Splitter', desc: 'Carbon fiber front splitter for increased front-axle downforce.', specs: 'Material: CFRP | Downforce: +15kg @ 250km/h' },
    'pipe': { label: 'Exhaust Pipe', desc: 'Stainless steel exhaust routing with catalytic converters and particulate filter.', specs: 'Material: Stainless Steel' },
    'caliper': { label: 'Brake Caliper', desc: 'M Compound 6-piston fixed caliper in signature BMW M blue.', specs: '6-piston front | 4-piston rear' },
    'disc': { label: 'Brake Disc', desc: 'Cross-drilled ventilated brake disc for optimal heat dissipation.', specs: 'Size: 380mm | Cross-drilled' },
};

function findPartInfo(name) {
    const lower = name.toLowerCase();
    for (const [key, info] of Object.entries(PART_LABELS)) {
        if (lower.includes(key)) {
            return info;
        }
    }
    return null;
}

function formatMeshName(name) {
    return name
        .replace(/[_.-]/g, ' ')
        .replace(/\d+$/, '')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();
}

export async function loadCarModel(onProgress) {
    const loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    return new Promise((resolve, reject) => {
        loader.load(
            './bmw.glb',
            (gltf) => {
                const model = gltf.scene;
                const parts = new Map();
                const group = new THREE.Group();

                // Calculate model bounds
                const bbox = new THREE.Box3().setFromObject(model);
                const center = bbox.getCenter(new THREE.Vector3());
                const size = bbox.getSize(new THREE.Vector3());

                // Normalize model size and center it
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 5.0 / maxDim;
                model.scale.setScalar(scale);

                // Center horizontally, place bottom on ground
                const offset = center.clone().multiplyScalar(scale);
                model.position.set(-offset.x, -offset.y, -offset.z);

                // Recalculate after scaling to fix ground placement
                const scaledBbox = new THREE.Box3().setFromObject(model);
                model.position.y -= scaledBbox.min.y; // lift so wheels sit on ground

                // Repaint: only white + black palette, soft white (no glare)
                model.traverse((child) => {
                    if (!child.isMesh) return;
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(m => {
                        if (!m.color) return;
                        const hsl = {};
                        m.color.getHSL(hsl);

                        // Decide white vs black based on lightness
                        if (hsl.l > 0.35) {
                            // White paint - soft, not glaring
                            m.color.setHex(0xd8d8d8);
                            if (m.metalness !== undefined) m.metalness = Math.min(m.metalness, 0.35);
                            if (m.roughness !== undefined) m.roughness = Math.max(m.roughness, 0.25);
                        } else {
                            // Black / dark parts
                            m.color.setHex(0x111111);
                        }

                        // Kill any colored emissive
                        if (m.emissive) {
                            const emHsl = {};
                            m.emissive.getHSL(emHsl);
                            if (emHsl.s > 0.3) {
                                m.emissive.setHex(0x000000);
                                m.emissiveIntensity = 0;
                            }
                        }
                    });
                });

                // Recalculate bounds after normalization
                const newBbox = new THREE.Box3().setFromObject(model);
                const newCenter = newBbox.getCenter(new THREE.Vector3());

                // Collect all meshes and significant groups
                const collectedParts = [];
                const processedMeshes = new Set();

                model.traverse((child) => {
                    if (processedMeshes.has(child.uuid)) return;

                    if (child.isMesh && !processedMeshes.has(child.uuid)) {
                        processedMeshes.add(child.uuid);

                        // Use the nearest named parent or the mesh itself
                        let partRoot = child;
                        let current = child.parent;
                        while (current && current !== model) {
                            if (current.name && current.name.length > 1 && current.children.length <= 20) {
                                partRoot = current;
                                break;
                            }
                            current = current.parent;
                        }

                        // Check if this part root was already collected
                        const existingPart = collectedParts.find(p => p.root === partRoot);
                        if (!existingPart) {
                            const partBbox = new THREE.Box3().setFromObject(partRoot);
                            const partCenter = partBbox.getCenter(new THREE.Vector3());
                            const partSize = partBbox.getSize(new THREE.Vector3());

                            // Skip very tiny parts
                            if (partSize.length() < 0.02) return;

                            collectedParts.push({
                                root: partRoot,
                                center: partCenter,
                                size: partSize,
                                name: partRoot.name || child.name || `Part_${collectedParts.length}`,
                            });
                        }
                    }
                });

                // Merge nearby small parts into groups, keep significant ones
                const significantParts = [];
                const merged = new Set();

                // Sort by size (largest first)
                collectedParts.sort((a, b) => b.size.length() - a.size.length());

                for (let i = 0; i < collectedParts.length; i++) {
                    if (merged.has(i)) continue;

                    const part = collectedParts[i];

                    // If the part is large enough or has a recognizable name
                    const info = findPartInfo(part.name);
                    if (part.size.length() > 0.15 || info) {
                        significantParts.push(part);
                        merged.add(i);
                    }
                }

                // Limit to reasonable number of parts (max ~25)
                const finalParts = significantParts.slice(0, 25);

                // If we got very few named parts, also add remaining large unnamed parts
                if (finalParts.length < 8) {
                    for (const part of collectedParts) {
                        if (!finalParts.includes(part) && part.size.length() > 0.1) {
                            finalParts.push(part);
                            if (finalParts.length >= 20) break;
                        }
                    }
                }

                // Setup each part for explosion
                finalParts.forEach((partData, index) => {
                    const { root, center: partCenter, name } = partData;

                    // Calculate explosion direction (from model center outward)
                    const dir = new THREE.Vector3().subVectors(partCenter, newCenter);

                    // Enhance vertical separation
                    if (Math.abs(dir.y) < 0.3) {
                        dir.y += (partCenter.y > newCenter.y) ? 0.5 : -0.3;
                    }

                    // Scale explosion based on distance from center
                    const dist = dir.length();
                    const explosionScale = 2.5 + dist * 0.8;
                    dir.normalize().multiplyScalar(explosionScale);

                    // Get part info from labels dictionary
                    const info = findPartInfo(name);
                    const label = info ? info.label : formatMeshName(name);
                    const description = info ? info.desc : `Component: ${formatMeshName(name)}. Precision-engineered for the BMW M4 Competition.`;
                    const specs = info ? info.specs : '';

                    const originalPos = root.position.clone();
                    const partId = `part_${index}_${name.substring(0, 20)}`;

                    root.userData.partId = partId;
                    root.traverse(child => {
                        child.userData.partId = partId;
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    // Stagger explosion timing based on position
                    const yNorm = (partCenter.y - newCenter.y) / (size.y * scale || 1);
                    const distNorm = dist / (size.length() * scale || 1);
                    const startFactor = Math.max(0, 0.1 * distNorm);
                    const endFactor = Math.min(1, 0.6 + 0.4 * distNorm);

                    // Collect materials
                    const materials = [];
                    root.traverse(child => {
                        if (child.isMesh && child.material) {
                            if (Array.isArray(child.material)) {
                                child.material = child.material.map(m => m.clone());
                                materials.push(...child.material);
                            } else {
                                child.material = child.material.clone();
                                materials.push(child.material);
                            }
                        }
                    });

                    parts.set(partId, {
                        mesh: root,
                        originalPosition: originalPos,
                        explodedOffset: dir,
                        label,
                        description,
                        specs,
                        highlightIntensity: 0,
                        startFactor,
                        endFactor,
                        materials,
                    });
                });

                group.add(model);

                dracoLoader.dispose();
                resolve({ group, parts });
            },
            (progress) => {
                if (onProgress && progress.total) {
                    onProgress(progress.loaded / progress.total);
                }
            },
            (error) => {
                console.error('Error loading model:', error);
                reject(error);
            }
        );
    });
}
