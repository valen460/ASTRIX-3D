
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { missions, sabotages, completeMission, getMissionProgress } from "./missions.js";

const menu = document.getElementById("menu");
const playButton = document.getElementById("play");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080d18);
scene.fog = new THREE.Fog(0x080d18, 25, 70);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 16, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.style.display = "none";
document.getElementById("game").appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xb9d8ff, 0x18202d, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 3);
sunlight.position.set(-8, 15, 8);
sunlight.castShadow = true;
scene.add(sunlight);

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(30, 0.5, 24),
  new THREE.MeshStandardMaterial({
    color: 0x263647,
    metalness: 0.65,
    roughness: 0.45
  })
);
floor.position.y = -0.3;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(30, 30, 0x54718d, 0x35485d);
grid.position.y = -0.04;
scene.add(grid);

const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x52677b,
  metalness: 0.8,
  roughness: 0.35
});

function createWall(x, z, width, depth) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, 3, depth),
    wallMaterial
  );
  mesh.position.set(x, 1.2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

createWall(0, -12, 30, 0.5);
createWall(-15, 0, 0.5, 24);
createWall(15, 0, 0.5, 24);
createWall(-8, 3, 0.4, 8);
createWall(8, -3, 0.4, 8);

for (let x = -12; x <= 12; x += 6) {
  const lamp = new THREE.PointLight(0x38baff, 8, 8);
  lamp.position.set(x, 2.3, -10);
  scene.add(lamp);
}

function createAstronaut(color, x, z) {
  const astronaut = new THREE.Group();

  const suit = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.35,
    roughness: 0.3
  });

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.65, 0.8, 6, 12),
    suit
  );
  body.position.y = 1;
  body.castShadow = true;
  astronaut.add(body);

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.43, 24, 16),
    new THREE.MeshStandardMaterial({
      color: 0x7edcff,
      metalness: 0.8,
      roughness: 0.12
    })
  );
  visor.scale.set(1.15, 0.7, 0.35);
  visor.position.set(0, 1.65, 0.5);
  astronaut.add(visor);

  astronaut.position.set(x, 0, z);
  scene.add(astronaut);
  return astronaut;
}

const player = createAstronaut(0x21c9ff, 0, 0);
createAstronaut(0xff4c5e, 3, -2);
createAstronaut(0xffd34e, -4, 2);

const keys = {};
let gameStarted = false;

window.addEventListener("keydown", event => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

playButton.addEventListener("click", () => {
  gameStarted = true;
  menu.style.display = "none";
  renderer.domElement.style.display = "block";
  camera.position.set(player.position.x, 16, player.position.z + 18);
  camera.lookAt(player.position.x, 0, player.position.z);
});

function animate() {
  requestAnimationFrame(animate);

  if (gameStarted) {
    const speed = 0.09;

    if (keys["z"] || keys["w"] || keys["arrowup"]) player.position.z -= speed;
    if (keys["s"] || keys["arrowdown"]) player.position.z += speed;
    if (keys["q"] || keys["a"] || keys["arrowleft"]) player.position.x -= speed;
    if (keys["d"] || keys["arrowright"]) player.position.x += speed;

    player.position.x = THREE.MathUtils.clamp(player.position.x, -13, 13);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -10, 10);

    camera.position.x += (player.position.x - camera.position.x) * 0.04;
    camera.position.z += (player.position.z + 18 - camera.position.z) * 0.04;
    camera.lookAt(player.position.x, 0, player.position.z);

    renderer.render(scene, camera);
  }
}

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

animate();
