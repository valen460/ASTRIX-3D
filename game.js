
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const container = document.getElementById("game");
const menu = document.getElementById("menu");
const playButton = document.getElementById("play");

let scene, camera, renderer, player;
let started = false;
const keys = {};

const rooms = [
  { name: "CAFETERIA", x: 0, z: 0, w: 15, h: 12 },
  { name: "NAVIGATION", x: 19, z: -13, w: 11, h: 9 },
  { name: "ARMURERIE", x: 19, z: 0, w: 11, h: 9 },
  { name: "OXYGENE", x: 19, z: 13, w: 11, h: 9 },
  { name: "ELECTRICITE", x: -18, z: -13, w: 12, h: 9 },
  { name: "MOTEURS", x: -20, z: 13, w: 12, h: 9 },
  { name: "SECURITE", x: -18, z: 0, w: 12, h: 9 },
  { name: "COMMUNICATIONS", x: 0, z: -16, w: 12, h: 9 },
  { name: "INFIRMERIE", x: 0, z: 16, w: 12, h: 9 },
  { name: "STOCKAGE", x: -36, z: 0, w: 12, h: 11 },
  { name: "SERRE", x: 36, z: 0, w: 12, h: 11 },
  { name: "REACTEUR", x: -36, z: 14, w: 12, h: 9 }
];

function material(color, metalness = 0.5, roughness = 0.45) {
  return new THREE.MeshStandardMaterial({
    color, metalness, roughness
  });
}

function box(w, h, d, mat, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d), mat
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function makeLabel(text, x, z) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#071827";
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = "#35cfff";
  ctx.lineWidth = 5;
  ctx.strokeRect(5, 5, 502, 118);
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#b9efff";
  ctx.fillText(text, 256, 80);

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture })
  );
  sprite.position.set(x, 4, z);
  sprite.scale.set(8, 2, 1);
  scene.add(sprite);
}

function buildRoom(room) {
  const floorMat = material("#253b50", 0.75, 0.35);
  const wallMat = material("#60788d", 0.8, 0.3);
  const glowMat = new THREE.MeshStandardMaterial({
    color: "#36cfff",
    emissive: "#087ca8",
    emissiveIntensity: 1.5
  });

  box(room.w, 0.5, room.h, floorMat, room.x, -0.3, room.z);

  const wallHeight = 4;
  const t = 0.6;

  box(room.w, wallHeight, t, wallMat,
    room.x, wallHeight / 2, room.z - room.h / 2);

  box(room.w, wallHeight, t, wallMat,
    room.x, wallHeight / 2, room.z + room.h / 2);

  box(t, wallHeight, room.h, wallMat,
    room.x - room.w / 2, wallHeight / 2, room.z);

  box(t, wallHeight, room.h, wallMat,
    room.x + room.w / 2, wallHeight / 2, room.z);

  // Bandes lumineuses sur le sol
  box(room.w * 0.7, 0.08, 0.12, glowMat,
    room.x, 0.02, room.z - room.h / 2 + 0.7);

  // Consoles
  for (let i = -1; i <= 1; i++) {
    box(1.6, 1.2, 0.8, wallMat,
      room.x + i * 2.5, 0.5, room.z + room.h / 2 - 1.5);

    box(1.3, 0.08, 0.65, glowMat,
      room.x + i * 2.5, 1.15, room.z + room.h / 2 - 1.5);
  }

  makeLabel(room.name, room.x, room.z);
}

function buildCorridor(x1, z1, x2, z2) {
  const length = Math.hypot(x2 - x1, z2 - z1);
  const angle = Math.atan2(z2 - z1, x2 - x1);

  const corridor = box(
    length, 0.35, 4,
    material("#344e65", 0.8, 0.35),
    (x1 + x2) / 2, -0.15, (z1 + z2) / 2
  );
  corridor.rotation.y = -angle;
}

function buildShip() {
  rooms.forEach(buildRoom);

  // Couloirs reliant les différentes zones
  buildCorridor(0, 0, 19, -13);
  buildCorridor(0, 0, 19, 0);
  buildCorridor(0, 0, 19, 13);
  buildCorridor(0, 0, -18, -13);
  buildCorridor(0, 0, -18, 0);
  buildCorridor(0, 0, -20, 13);
  buildCorridor(0, 0, 0, -16);
  buildCorridor(0, 0, 0, 16);
  buildCorridor(-18, 0, -36, 0);
  buildCorridor(19, 0, 36, 0);
  buildCorridor(-20, 13, -36, 14);

  // Grand sol extérieur
  box(100, 0.4, 55,
    material("#101e2e", 0.7, 0.6),
    0, -1, 0
  );
}

function buildPlayer() {
  player = new THREE.Group();

  const bodyMat = material("#e43c55", 0.4, 0.3);
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: "#8ceaff",
    metalness: 0.8,
    roughness: 0.12,
    clearcoat: 1
  });

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.8, 1.1, 6, 12),
    bodyMat
  );
  body.position.y = 1.15;
  body.castShadow = true;
  player.add(body);

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 24, 16),
    visorMat
  );
  visor.scale.set(1, 0.72, 0.45);
  visor.position.set(0, 1.65, 0.58);
  player.add(visor);

  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 1.1, 0.55),
    bodyMat
  );
  backpack.position.set(0, 1.1, -0.72);
  player.add(backpack);

  player.position.set(0, 0, 0);
  scene.add(player);
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#07111e");
  scene.fog = new THREE.Fog("#07111e", 65, 130);

  camera = new THREE.PerspectiveCamera(
    48, window.innerWidth / window.innerHeight, 0.1, 300
  );
  camera.position.set(0, 42, 48);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight("#b8e8ff", "#172438", 2));

  const sun = new THREE.DirectionalLight("#ffffff", 3);
  sun.position.set(15, 35, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  buildShip();
  buildPlayer();

  window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
  });

  window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
  });

  window.addEventListener("resize", resize);
  animate();
}

function resize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (player && started) {
    const speed = 0.16;
    let dx = 0;
    let dz = 0;

    if (keys["z"] || keys["arrowup"] || keys["w"]) dz -= speed;
    if (keys["s"] || keys["arrowdown"]) dz += speed;
    if (keys["q"] || keys["arrowleft"] || keys["a"]) dx -= speed;
    if (keys["d"] || keys["arrowright"]) dx += speed;

    player.position.x += dx;
    player.position.z += dz;

    if (dx !== 0 || dz !== 0) {
      player.rotation.y = Math.atan2(dx, dz);
    }

    camera.position.x += (player.position.x - camera.position.x) * 0.04;
    camera.position.z += (player.position.z + 48 - camera.position.z) * 0.04;
    camera.lookAt(player.position.x, 0, player.position.z);
  }

  if (renderer) renderer.render(scene, camera);
}

playButton.addEventListener("click", () => {
  if (started) return;
  started = true;
  menu.style.display = "none";

  if (!renderer) init();
});
