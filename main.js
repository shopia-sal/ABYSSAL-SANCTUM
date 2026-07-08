import * as THREE from "https://esm.sh/three@0.160.0";
import { VRButton } from "https://esm.sh/three@0.160.0/examples/jsm/webxr/VRButton.js";
import { createWorld } from "./world.js";
import { createPlayer } from "./player.js";
import { createShooter } from "./shooter.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  120,
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("c"),
  antialias: true,
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.xr.enabled = true;

const { colliders, pulseObjects, jellies, bubbles } = createWorld(scene);
const player = createPlayer(camera, renderer.domElement, colliders);

const ballCountEl = document.getElementById("ballCount");
const shooter = createShooter(scene, camera, (n) => {
  ballCountEl.textContent = n;
});

const startOverlay = document.getElementById("startOverlay");
startOverlay.addEventListener("click", () => player.controls.lock());
player.controls.addEventListener("lock", () =>
  startOverlay.classList.add("hidden"),
);
player.controls.addEventListener("unlock", () =>
  startOverlay.classList.remove("hidden"),
);

window.addEventListener("click", () => {
  if (player.controls.isLocked) shooter.shoot();
});

document
  .getElementById("vrBtnWrap")
  .appendChild(VRButton.createButton(renderer));

/* ---------- Resize ---------- */
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
let fpsTimer = 0,
  fpsFrames = 0;
const fpsEl = document.getElementById("fpsCount");
let t = 0;

renderer.setAnimationLoop(() => {
  const delta = Math.min(clock.getDelta(), 0.05);
  t += delta;

  player.update(delta);
  shooter.update(delta);
  bubbles.update(delta);

  pulseObjects.forEach((o) => {
    const pulse = 0.35 + Math.sin(t * o.userData.pulseSpeed) * 0.25;
    o.userData.pulseMeshes.forEach((m) => {
      m.material.emissiveIntensity = pulse;
    });
  });

  jellies.forEach((j) => {
    j.position.y =
      j.userData.baseY +
      Math.sin(t * j.userData.bobSpeed + j.userData.bobOffset) * 0.4;
    j.rotation.y += 0.15 * delta;
  });

  fpsFrames++;
  fpsTimer += delta;
  if (fpsTimer >= 0.5) {
    fpsEl.textContent = Math.round(fpsFrames / fpsTimer);
    fpsFrames = 0;
    fpsTimer = 0;
  }

  renderer.render(scene, camera);
});
