// High-Production Broadcast 3D Stage System
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

let scene, camera, renderer;
let stageGroup, teamCardMesh, clubCardMesh;
let particlesMesh, lightRays = [];
let canvasContainer;

export function init3DScene(containerId) {
  canvasContainer = document.getElementById(containerId);
  if (!canvasContainer) return;

  canvasContainer.innerHTML = '';

  // 1. Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0c18, 0.02);

  // 2. Camera
  camera = new THREE.PerspectiveCamera(45, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
  camera.position.set(0, 3.8, 10.5);
  camera.lookAt(0, 1.4, 0);

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasContainer.appendChild(renderer.domElement);

  // 4. Studio Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  const goldSpot = new THREE.SpotLight(0xd4af37, 3);
  goldSpot.position.set(0, 14, 6);
  goldSpot.angle = Math.PI / 4;
  goldSpot.penumbra = 0.5;
  goldSpot.castShadow = true;
  scene.add(goldSpot);

  const cyanSpot = new THREE.SpotLight(0x00e5ff, 2.5);
  cyanSpot.position.set(-9, 12, -2);
  scene.add(cyanSpot);

  const magentaSpot = new THREE.SpotLight(0xff0055, 2.5);
  magentaSpot.position.set(9, 12, -2);
  scene.add(magentaSpot);

  // 5. Studio Stage
  createBroadcastStage();

  // 6. 3D Cards
  createCards();

  // 7. Dynamic Particles
  createParticles();

  // 8. Resize Handler
  window.removeEventListener('resize', onWindowResize);
  window.addEventListener('resize', onWindowResize);

  // 9. Animation Loop
  animate();
}

function createBroadcastStage() {
  stageGroup = new THREE.Group();

  // Glossy Reflective Floor
  const floorGeo = new THREE.PlaneGeometry(60, 60);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0c0e1a,
    roughness: 0.1,
    metalness: 0.9
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  stageGroup.add(floor);

  // Curved Podium Base
  const platformGeo = new THREE.CylinderGeometry(4.2, 4.8, 0.5, 64);
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0x181a2e,
    metalness: 0.8,
    roughness: 0.2
  });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.y = 0.25;
  platform.receiveShadow = true;
  stageGroup.add(platform);

  // Double Neon Glowing Rings
  const ringGeo1 = new THREE.TorusGeometry(4.3, 0.05, 16, 100);
  const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.y = 0.51;
  stageGroup.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(3.6, 0.04, 16, 100);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.x = Math.PI / 2;
  ring2.position.y = 0.52;
  stageGroup.add(ring2);

  scene.add(stageGroup);
}

function createCards() {
  const cardGeo = new THREE.BoxGeometry(2.3, 3.4, 0.1);

  // Left Card (Team)
  const teamMat = new THREE.MeshStandardMaterial({
    color: 0x0f2238,
    metalness: 0.85,
    roughness: 0.15,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.25
  });
  teamCardMesh = new THREE.Mesh(cardGeo, teamMat);
  teamCardMesh.position.set(-2.2, 2.3, 0);
  teamCardMesh.castShadow = true;
  scene.add(teamCardMesh);

  // Right Card (Club)
  const clubMat = new THREE.MeshStandardMaterial({
    color: 0x382a0f,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0xd4af37,
    emissiveIntensity: 0.3
  });
  clubCardMesh = new THREE.Mesh(cardGeo, clubMat);
  clubCardMesh.position.set(2.2, 2.3, 0);
  clubCardMesh.castShadow = true;
  scene.add(clubCardMesh);
}

function createParticles() {
  const count = 250;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 22;
    positions[i + 1] = Math.random() * 12;
    positions[i + 2] = (Math.random() - 0.5) * 22;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xd4af37,
    size: 0.09,
    transparent: true,
    opacity: 0.7
  });

  particlesMesh = new THREE.Points(geometry, material);
  scene.add(particlesMesh);
}

function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.002;
  if (teamCardMesh && !teamCardMesh.userData.isAnimating) {
    teamCardMesh.position.y = 2.3 + Math.sin(time) * 0.09;
    teamCardMesh.rotation.y = Math.sin(time * 0.5) * 0.06;
  }
  if (clubCardMesh && !clubCardMesh.userData.isAnimating) {
    clubCardMesh.position.y = 2.3 + Math.sin(time + 1.2) * 0.09;
    clubCardMesh.rotation.y = Math.sin((time + 1.2) * 0.5) * 0.06;
  }

  if (particlesMesh) {
    particlesMesh.rotation.y += 0.0008;
  }

  if (stageGroup) {
    stageGroup.rotation.y += 0.0015;
  }

  renderer.render(scene, camera);
}

export function animateCardReveal(cardType, onFinish) {
  const targetMesh = cardType === 'team' ? teamCardMesh : clubCardMesh;
  if (!targetMesh) return;

  targetMesh.userData.isAnimating = true;

  const startY = targetMesh.position.y;
  const startRotY = targetMesh.rotation.y;
  let frame = 0;
  const totalFrames = 60;

  const anim = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;

    targetMesh.position.y = startY + Math.sin(progress * Math.PI) * 1.6;
    targetMesh.rotation.y = startRotY + progress * Math.PI * 4;
    targetMesh.position.z = Math.sin(progress * Math.PI) * 2.2;

    if (frame >= totalFrames) {
      clearInterval(anim);
      targetMesh.position.y = 2.3;
      targetMesh.position.z = 0;
      targetMesh.rotation.y = 0;
      targetMesh.userData.isAnimating = false;
      if (onFinish) onFinish();
    }
  }, 16);
}

function onWindowResize() {
  if (!canvasContainer || !camera || !renderer) return;
  camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}
