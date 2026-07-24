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

const { colliders, pulseObjects, jellies, bubbles, portalGate } = createWorld(scene);
const player = createPlayer(camera, renderer.domElement, colliders);

let portalTransitioning = false;

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
  if (player.controls.isLocked && !portalTransitioning) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(portalGate.children, true);
    if (intersects.length > 0 && intersects[0].distance < 45) {
      portalTransitioning = true;
      document.body.style.transition = "opacity 0.5s ease";
      document.body.style.opacity = "0";
      setTimeout(() => {
        window.location.href = "scene2.html";
      }, 500);
      return;
    }
    shooter.shoot();
  }
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

  /* Portal Proximity Detection */
  if (portalGate && !portalTransitioning) {
    const dist = camera.position.distanceTo(portalGate.position);
    if (dist < 3.2) {
      portalTransitioning = true;
      document.body.style.transition = "opacity 0.5s ease";
      document.body.style.opacity = "0";
      setTimeout(() => {
        window.location.href = "scene2.html";
      }, 500);
    }
  }

  pulseObjects.forEach((o) => {
    const pulse = 0.35 + Math.sin(t * o.userData.pulseSpeed) * 0.25;
    o.userData.pulseMeshes.forEach((m) => {
      m.material.emissiveIntensity = pulse;
    });
    if (o.userData.artifactObj) {
      o.userData.artifactObj.rotation.y += 0.8 * delta;
      o.userData.artifactObj.rotation.x += 0.3 * delta;
    }
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
