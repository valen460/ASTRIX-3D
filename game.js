
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { missions, sabotages, completeMission, getMissionProgress } from "./missions.js";

// ASTRIX 3D - Prototype de jeu enrichi

const menu = document.getElementById("menu");
const playButton = document.getElementById("play");
const game = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07101d);
scene.fog = new THREE.Fog(0x07101d, 35, 85);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 150);
camera.position.set(0, 35, 27);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.domElement.style.display = "none";
game.appendChild(renderer.domElement);

// Lumières
scene.add(new THREE.HemisphereLight(0x9bcaff, 0x182333, 2));

const mainLight = new THREE.DirectionalLight(0xffffff, 3);
mainLight.position.set(-12, 25, 15);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(2048, 2048);
scene.add(mainLight);

const blueLight = new THREE.PointLight(0x168cff, 65, 38);
blueLight.position.set(0, 7, 0);
scene.add(blueLight);

// Matériaux
const materials = {
  floor: new THREE.MeshStandardMaterial({
    color: 0x26384b, metalness: 0.8, roughness: 0.38
  }),
  wall: new THREE.MeshStandardMaterial({
    color: 0x536b82, metalness: 0.8, roughness: 0.3
  }),
  dark: new THREE.MeshStandardMaterial({
    color: 0x101c2c, metalness: 0.7, roughness: 0.35
  }),
  blue: new THREE.MeshStandardMaterial({
    color: 0x168bce, emissive: 0x063d70, metalness: 0.5
  }),
  white: new THREE.MeshStandardMaterial({
    color: 0xd6eaff, metalness: 0.6, roughness: 0.25
  }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x43c9ff, emissive: 0x075080,
    metalness: 0.8, roughness: 0.15
  })
};

function addBox(x, y, z, w, h, d, material, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    material
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Sol principal
addBox(0, -0.5, 0, 40, 1, 30, materials.dark);

// Dalles métalliques
for (let x = -18; x <= 18; x += 3) {
  for (let z = -13; z <= 13; z += 3) {
    addBox(x, 0.03, z, 2.9, 0.08, 2.9, materials.floor);
    addBox(x, 0.09, z, 0.035, 0.015, 2.7, materials.white);
  }
}

// Murs extérieurs
function wall(x, z, w, d, h = 4) {
  addBox(x, h / 2, z, w, h, d, materials.wall);
  addBox(x, h + 0.12, z, w, 0.25, d, materials.blue);
}

wall(0, -15, 40, 0.7);
wall(0, 15, 40, 0.7);
wall(-20, 0, 0.7, 30);
wall(20, 0, 0.7, 30);

// Salles du vaisseau
const rooms = [
  { x: -12, z: -8, name: "MOTEURS", color: 0x168bce },
  { x: 12, z: -8, name: "INFIRMERIE", color: 0x20cba0 },
  { x: -12, z: 8, name: "RÉACTEUR", color: 0xe5a333 },
  { x: 12, z: 8, name: "COMMUNICATIONS", color: 0x9b72ed }
];

for (const room of rooms) {
  addBox(room.x, 0.12, room.z, 13, 0.15, 10,
    new THREE.MeshStandardMaterial({
      color: room.color, metalness: 0.55, roughness: 0.5
    }));

  // Murs avec ouverture vers le couloir central
  wall(room.x - 6.5, room.z, 0.35, 10, 3.5);
  wall(room.x + 6.5, room.z, 0.35, 10, 3.5);

  const backZ = room.z < 0 ? room.z - 5 : room.z + 5;
  wall(room.x, backZ, 13, 0.35, 3.5);

  // Enseigne lumineuse
  const sign = addBox(room.x, 3.2, room.z < 0 ? room.z + 4.6 : room.z - 4.6,
    3.8, 0.45, 0.15, materials.blue);
  sign.material = new THREE.MeshStandardMaterial({
    color: room.color, emissive: room.color, emissiveIntensity: 1.5
  });

  const light = new THREE.PointLight(room.color, 28, 13);
  light.position.set(room.x, 3.2, room.z);
  scene.add(light);
}

// Couloir central
addBox(0, 0.14, 0, 11, 0.15, 28, materials.floor);

// Détails du couloir
for (let z = -12; z <= 12; z += 4) {
  addBox(0, 0.25, z, 0.16, 0.08, 2, materials.blue);
}

// Décorations murales
for (let z = -12; z <= 12; z += 4) {
  addBox(-19.5, 2, z, 0.12, 1.2, 1.4, materials.glass);
  addBox(19.5, 2, z, 0.12, 1.2, 1.4, materials.glass);
}

// Portes décoratives
function createDoor(x, z) {
  const group = new THREE.Group();
  addBox(0, 1.7, 0, 2.7, 3.4, 0.3, materials.dark, group);
  addBox(-0.65, 1.7, 0.2, 1.1, 3.1, 0.18, materials.blue, group);
  addBox(0.65, 1.7, 0.2, 1.1, 3.1, 0.18, materials.blue, group);
  group.position.set(x, 0, z);
  scene.add(group);
}
createDoor(-5.2, -1);
createDoor(5.2, 1);

// Consoles de missions
const consoles = [];

function createConsole(x, z, color, missionId) {
  const group = new THREE.Group();

  addBox(0, 0.65, 0, 1.5, 1.3, 1, materials.dark, group);
  addBox(0, 1.35, -0.1, 1.3, 0.12, 0.8, materials.blue, group);
  addBox(0, 1.7, -0.3, 1.1, 0.65, 0.12, materials.white, group);

  const screen = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.8
  });
  addBox(0, 1.7, -0.2, 0.9, 0.42, 0.04, screen, group);

  group.position.set(x, 0, z);
  scene.add(group);

  consoles.push({ x, z, missionId, group });
}

createConsole(-12, -7, 0x23baff, 1);
createConsole(12, -7, 0x27e5a5, 2);
createConsole(-12, 8, 0xffbd43, 3);
createConsole(12, 8, 0xa783ff, 4);
createConsole(0, 0, 0x38caff, 5);

// Personnages
function createAstronaut(color, x, z, name) {
  const astronaut = new THREE.Group();

  const suit = new THREE.MeshStandardMaterial({
    color, metalness: 0.35, roughness: 0.3
  });

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.7, 0.9, 6, 16),
    suit
  );
  body.position.y = 1;
  body.castShadow = true;
  astronaut.add(body);

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 32, 20),
    materials.glass
  );
  visor.scale.set(1.15, 0.72, 0.38);
  visor.position.set(0, 1.7, 0.5);
  astronaut.add(visor);

  // Sac à dos
  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.9, 0.42),
    materials.dark
  );
  backpack.position.set(0, 0.95, -0.55);
  astronaut.add(backpack);

  astronaut.position.set(x, 0, z);
  astronaut.userData.name = name;
  scene.add(astronaut);

  return astronaut;
}

const player = createAstronaut(0x16caff, 0, 2, "Toi");
const bots = [
  createAstronaut(0xff465d, -4, -3, "Rouge"),
  createAstronaut(0xffd34d, 4, 3, "Jaune"),
  createAstronaut(0x32d58b, -14, 8, "Vert"),
  createAstronaut(0xa879ff, 14, -8, "Violet")
];

// Interface de jeu
const hud = document.createElement("div");
hud.id = "astrix-hud";
hud.innerHTML = `
<style>
#astrix-hud { position:fixed; inset:0; z-index:8; pointer-events:none;
font-family:Arial,sans-serif; color:white; }
#astrix-hud button { pointer-events:auto; cursor:pointer; border:1px solid #49caff;
background:linear-gradient(135deg,#12618b,#122b54); color:white;
border-radius:9px; padding:11px 15px; font-weight:bold; }
#astrix-top { position:absolute; top:15px; left:15px; background:#071727dd;
padding:13px 17px; border:1px solid #2689bd; border-radius:10px; }
#astrix-actions { position:absolute; right:15px; bottom:20px;
display:flex; flex-direction:column; gap:9px; align-items:flex-end; }
#astrix-task { position:absolute; left:50%; bottom:20px; transform:translateX(-50%);
background:#071727ee; padding:12px 18px; border-radius:10px;
border:1px solid #2689bd; text-align:center; min-width:220px; }
#astrix-message { position:absolute; top:20%; left:50%; transform:translateX(-50%);
background:#071727ee; padding:15px 22px; border:1px solid #49caff;
border-radius:10px; display:none; text-align:center; }
#astrix-meeting { position:absolute; inset:0; display:none; pointer-events:auto;
background:#030914ed; align-items:center; justify-content:center; }
#astrix-meeting-card { background:#10243a; border:2px solid #38bfff;
border-radius:15px; padding:25px; width:min(90%,390px); text-align:center; }
#astrix-meeting button { display:block; width:100%; margin:8px 0; }
#astrix-controls { position:absolute; left:15px; bottom:18px;
display:grid; grid-template-columns:45px 45px 45px; gap:4px; pointer-events:auto; }
#astrix-controls button { padding:10px; font-size:17px; touch-action:none; }
</style>

<div id="astrix-top">
  <b style="color:#69d9ff;font-size:20px">ASTRIX 3D</b><br>
  <span id="astrix-role">Équipier</span><br>
  <span id="astrix-progress">Missions : 0/5</span>
</div>

<div id="astrix-task">
  <b>OBJECTIF</b><br>
  <span id="astrix-task-text">Explore le vaisseau</span><br>
  <button id="astrix-interact">INTERAGIR (E)</button>
</div>

<div id="astrix-actions">
  <button id="astrix-sabotage">⚡ SABOTAGE</button>
  <button id="astrix-report">🚨 RÉUNION</button>
</div>

<div id="astrix-controls">
  <span></span><button data-key="z">▲</button><span></span>
  <button data-key="q">◀</button><button data-key="s">▼</button>
  <button data-key="d">▶</button>
</div>

<div id="astrix-message"></div>

<div id="astrix-meeting">
  <div id="astrix-meeting-card">
    <h2>🚨 RÉUNION</h2>
    <p>Qui veux-tu accuser ?</p>
    <div id="astrix-votes"></div>
    <button id="astrix-close">RETOURNER AU VAISSEAU</button>
  </div>
</div>
`;
document.body.appendChild(hud);

const progressText = document.getElementById("astrix-progress");
const taskText = document.getElementById("astrix-task-text");
const interactButton = document.getElementById("astrix-interact");
const message = document.getElementById("astrix-message");
const meeting = document.getElementById("astrix-meeting");

let gameStarted = false;
let activeConsole = null;
let sabotageActive = false;
let sabotageEnd = 0;
let meetingOpen = false;

const keys = {};
const clock = new THREE.Clock();

function showMessage(text) {
  message.textContent = text;
  message.style.display = "block";
  setTimeout(() => message.style.display = "none", 2500);
}

// Déplacements clavier
window.addEventListener("keydown", event => {
  keys[event.key.toLowerCase()] = true;
  if (event.key.toLowerCase() === "e") interact();
});

window.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

// Commandes tactiles
document.querySelectorAll("#astrix-controls button").forEach(button => {
  const key = button.dataset.key;
  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    keys[key] = true;
  });
  button.addEventListener("pointerup", () => keys[key] = false);
  button.addEventListener("pointerleave", () => keys[key] = false);
  button.addEventListener("pointercancel", () => keys[key] = false);
});

// Démarrer
playButton.addEventListener("click", () => {
  gameStarted = true;
  menu.style.display = "none";
  renderer.domElement.style.display = "block";
  camera.position.set(0, 35, 27);
  camera.lookAt(0, 0, 0);
  showMessage("Bienvenue à bord d'ASTRIX !");
});

// Trouver une console proche
function findNearestConsole() {
  let nearest = null;
  let distance = Infinity;

  for (const console of consoles) {
    const d = Math.hypot(
      player.position.x - console.x,
      player.position.z - console.z
    );
    if (d < distance) {
      distance = d;
      nearest = console;
    }
  }

  return distance < 3.5 ? nearest : null;
}

// Missions
function updateMissionUI() {
  const progress = getMissionProgress();
  progressText.textContent =
    `Missions : ${progress.completed}/${progress.total}`;

  if (progress.completed === progress.total) {
    taskText.textContent = "Toutes les missions sont terminées !";
  }
}

function interact() {
  if (!gameStarted || meetingOpen) return;

  const target = findNearestConsole();

  if (!target) {
    showMessage("Approche-toi d'une console !");
    return;
  }

  const mission = missions.find(m => m.id === target.missionId);

  if (!mission) return;

  if (mission.completed) {
    showMessage("Cette mission est déjà terminée !");
    return;
  }

  completeMission(mission.id);
  showMessage("Mission terminée : " + mission.name);
  updateMissionUI();
}

interactButton.addEventListener("click", interact);

// Sabotage
document.getElementById("astrix-sabotage").addEventListener("click", () => {
  if (!gameStarted || meetingOpen) return;

  if (sabotageActive) {
    showMessage("Un sabotage est déjà actif !");
    return;
  }

  const sabotage = sabotages[Math.floor(Math.random() * sabotages.length)];
  sabotageActive = true;
  sabotageEnd = performance.now() + 15000;

  if (sabotage.id === "lights") {
    scene.fog = new THREE.Fog(0x02050b, 5, 22);
    blueLight.intensity = 5;
  }

  showMessage("SABOTAGE : " + sabotage.name);
});

// Réunion et vote local de démonstration
function openMeeting() {
  if (!gameStarted || meetingOpen) return;

  meetingOpen = true;
  meeting.style.display = "flex";

  const votes = document.getElementById("astrix-votes");
  votes.innerHTML = "";

  for (const bot of bots) {
    const button = document.createElement("button");
    button.textContent = "Voter contre " + bot.userData.name;
    button.addEventListener("click", () => {
      votes.innerHTML = `
        <h3>Vote enregistré</h3>
        <p>Tu as voté contre ${bot.userData.name}.</p>
        <p>Cette réunion est une simulation locale.</p>
      `;
    });
    votes.appendChild(button);
  }
}

document.getElementById("astrix-report").addEventListener("click", openMeeting);
document.getElementById("astrix-close").addEventListener("click", () => {
  meetingOpen = false;
  meeting.style.display = "none";
});

// Animation
function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  if (gameStarted) {
    const speed = 7 * delta;
    let moving = false;

    if (!meetingOpen) {
      if (keys["z"] || keys["w"] || keys["arrowup"]) {
        player.position.z -= speed;
        moving = true;
      }
      if (keys["s"] || keys["arrowdown"]) {
        player.position.z += speed;
        moving = true;
      }
      if (keys["q"] || keys["a"] || keys["arrowleft"]) {
        player.position.x -= speed;
        moving = true;
      }
      if (keys["d"] || keys["arrowright"]) {
        player.position.x += speed;
        moving = true;
      }
    }

    player.position.x = THREE.MathUtils.clamp(player.position.x, -18, 18);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -13, 13);

    if (moving) {
      player.rotation.y = Math.atan2(
        (keys["q"] || keys["a"] || keys["arrowleft"] ? -1 : 0) +
        (keys["d"] || keys["arrowright"] ? 1 : 0),
        (keys["z"] || keys["w"] || keys["arrowup"] ? -1 : 0) +
        (keys["s"] || keys["arrowdown"] ? 1 : 0)
      );
    }

    // Caméra qui suit le joueur
    camera.position.x += (player.position.x - camera.position.x) * 0.055;
    camera.position.z += (player.position.z + 25 - camera.position.z) * 0.055;
    camera.lookAt(player.position.x, 0, player.position.z);

    // Animation légère des personnages
    const t = performance.now() * 0.002;
    player.position.y = moving ? Math.abs(Math.sin(t * 5)) * 0.08 : 0;

    bots.forEach((bot, index) => {
      bot.position.y = Math.sin(t * 2 + index) * 0.04;
    });

    // Détection des consoles
    activeConsole = findNearestConsole();

    if (activeConsole) {
      const mission = missions.find(m => m.id === activeConsole.missionId);
      taskText.textContent = mission?.completed
        ? "Mission déjà terminée"
        : "Console à proximité : appuie sur E";
    } else {
      taskText.textContent = "Explore le vaisseau";
    }

    // Fin du sabotage
    if (sabotageActive && performance.now() > sabotageEnd) {
      sabotageActive = false;
      scene.fog = new THREE.Fog(0x07101d, 35, 85);
      blueLight.intensity = 65;
      showMessage("Le sabotage est terminé !");
    }

    renderer.render(scene, camera);
  }
}

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

updateMissionUI();
animate();
