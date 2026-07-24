import * as THREE from "https://esm.sh/three@0.160.0";

export const PALETTE = {
  abyss: 0x020a12,
  rock: 0x0c1a24,
  stone: 0x141f2b,
  teal: 0x2de6c9,
  violet: 0x8b5cf6,
  coral: 0xff6ec7,
  green: 0x7fffa0,
  deep: 0x3a7ca5,
};

const ROOM_HALF = 20;
const CAVE_H = 11;

function makeRockTexture() {
  const size = 512;
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = size;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "#0a1620";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(${10 + Math.random() * 20},${20 + Math.random() * 25},${30 + Math.random() * 30},0.5)`;
    const r = 8 + Math.random() * 40;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(45,230,201,0.35)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    let x = Math.random() * size,
      y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let j = 0; j < 5; j++) {
      x += (Math.random() - 0.5) * 80;
      y += (Math.random() - 0.5) * 80;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  return tex;
}

function loadCreaturePhoto(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error(`Gagal memuat aset lokal: ${url}`);
      reject();
    };
    img.src = url;
  });
}

function drawTabletCanvas(img, title, subtitle, colorHex) {
  const w = 512,
    h = 384;
  const cvs = document.createElement("canvas");
  cvs.width = w;
  cvs.height = h;
  const ctx = cvs.getContext("2d");
  const color = "#" + colorHex.toString(16).padStart(6, "0");

  if (img) {
    const scale = Math.max(w / img.width, h / img.height);
    const iw = img.width * scale,
      ih = img.height * scale;
    ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
    ctx.fillStyle = "rgba(2,10,18,0.25)";
    ctx.fillRect(0, 0, w, h);
  } else {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 340);
    grad.addColorStop(0, "#132433");
    grad.addColorStop(1, "#050d14");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  const capGrad = ctx.createLinearGradient(0, h - 110, 0, h);
  capGrad.addColorStop(0, "rgba(2,10,18,0)");
  capGrad.addColorStop(1, "rgba(2,10,18,0.92)");
  ctx.fillStyle = capGrad;
  ctx.fillRect(0, h - 110, w, 110);

  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#e8f6f3";
  ctx.font = "bold 28px Georgia";
  ctx.fillText(title, 20, h - 48);
  ctx.fillStyle = color;
  ctx.font = "italic 17px Georgia";
  ctx.fillText(subtitle, 20, h - 18);

  return new THREE.CanvasTexture(cvs);
}

function createSeaTablet(title, subtitle, colorHex, photoUrl) {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 2.7, 0.2),
    new THREE.MeshStandardMaterial({ color: PALETTE.stone, roughness: 0.95 }),
  );
  group.add(frame);

  const carvingMat = new THREE.MeshBasicMaterial({
    map: drawTabletCanvas(null, title, subtitle, colorHex),
  });
  const carving = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.3), carvingMat);
  carving.position.z = 0.11;
  group.add(carving);

  if (photoUrl) {
    loadCreaturePhoto(photoUrl)
      .then((img) => {
        carvingMat.map = drawTabletCanvas(img, title, subtitle, colorHex);
        carvingMat.needsUpdate = true;
      })
      .catch(() => {
        console.warn(`[Abyssal Sanctum] Gagal memuat foto: ${photoUrl}`);
      });
  }

  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(3.7, 0.08, 0.05),
    new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 1.4,
    }),
  );
  rim.position.set(0, -1.4, 0.11);
  group.add(rim);

  return group;
}

function createCoralCluster(colorHex) {
  const group = new THREE.Group();
  const branches = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < branches; i++) {
    const h = 1.2 + Math.random() * 1.6;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.28 + Math.random() * 0.15, h, 6),
      new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.35,
        roughness: 0.5,
        flatShading: true,
      }),
    );
    const ang = (i / branches) * Math.PI * 2;
    cone.position.set(Math.cos(ang) * 0.35, h / 2, Math.sin(ang) * 0.35);
    cone.rotation.z = (Math.random() - 0.5) * 0.3;
    cone.castShadow = true;
    group.add(cone);
  }
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.9, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: PALETTE.stone, roughness: 0.9 }),
  );
  base.position.y = 0.25;
  group.add(base);

  group.userData.pulseSpeed = 1 + Math.random();
  group.userData.pulseMeshes = group.children.filter(
    (c) => c.material && c.material.emissive,
  );
  return group;
}

function createJellyfish(colorHex) {
  const group = new THREE.Group();
  const bell = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.7),
    new THREE.MeshPhysicalMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      transmission: 0.3,
    }),
  );
  group.add(bell);

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const points = [];
    for (let j = 0; j < 5; j++)
      points.push(
        new THREE.Vector3(
          Math.cos(ang) * 0.35,
          -0.2 - j * 0.25,
          Math.sin(ang) * 0.35,
        ),
      );
    const tentacle = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.5,
      }),
    );
    group.add(tentacle);
  }

  const glow = new THREE.PointLight(colorHex, 2.2, 6);
  group.add(glow);

  group.userData.bobOffset = Math.random() * Math.PI * 2;
  group.userData.bobSpeed = 0.5 + Math.random() * 0.4;
  group.userData.baseY = 0;
  return group;
}

function createMuseumGlassCase(geometryType, colorHex, title, subtitle) {
  const group = new THREE.Group();

  // 1. Stone Pedestal Base
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: PALETTE.stone,
    roughness: 0.85,
    metalness: 0.2,
  });
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.4), pedestalMat);
  pedestal.position.y = 0.45;
  group.add(pedestal);

  // Pedestal Glowing Accent Rim
  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.06, 1.42),
    new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 1.5,
    })
  );
  rim.position.y = 0.9;
  group.add(rim);

  // 2. Museum Glass Cabinet Cover (Kotak Kaca Transparan)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdbf7ff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.4,
    side: THREE.DoubleSide,
  });
  const glassCase = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.4, 1.25), glassMat);
  glassCase.position.y = 1.6;
  group.add(glassCase);

  // Glass Frame Trim Edges
  const frameMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 1.2,
    roughness: 0.3,
  });
  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.04, 1.28), frameMat);
  topFrame.position.y = 2.3;
  group.add(topFrame);

  const pGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8);
  [
    [-0.62, 1.6, -0.62],
    [0.62, 1.6, -0.62],
    [-0.62, 1.6, 0.62],
    [0.62, 1.6, 0.62],
  ].forEach(([px, py, pz]) => {
    const post = new THREE.Mesh(pGeo, frameMat);
    post.position.set(px, py, pz);
    group.add(post);
  });

  // 3. Display Object Inside Glass Case (Box, Sphere, Cylinder, Torus, Cone)
  let geo;
  switch (geometryType) {
    case "box":
      geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      break;
    case "sphere":
      geo = new THREE.SphereGeometry(0.32, 24, 24);
      break;
    case "cylinder":
      geo = new THREE.CylinderGeometry(0.24, 0.24, 0.65, 24);
      break;
    case "torus":
      geo = new THREE.TorusGeometry(0.3, 0.12, 16, 32);
      break;
    case "cone":
      geo = new THREE.ConeGeometry(0.32, 0.65, 24);
      break;
    default:
      geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  }

  const objMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.7,
    roughness: 0.2,
    metalness: 0.5,
  });
  const artifactObj = new THREE.Mesh(geo, objMat);
  artifactObj.position.y = 1.6;
  group.add(artifactObj);

  // 4. Internal Spotlight
  const light = new THREE.PointLight(colorHex, 3.5, 4);
  light.position.set(0, 1.6, 0);
  group.add(light);

  // 5. Museum Label Plate
  const cvs = document.createElement("canvas");
  cvs.width = 256; cvs.height = 80;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = "rgba(4, 14, 24, 0.9)";
  ctx.fillRect(0, 0, 256, 80);
  ctx.strokeStyle = "#" + colorHex.toString(16).padStart(6, "0");
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 248, 72);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px Georgia";
  ctx.textAlign = "center";
  ctx.fillText(title, 128, 34);
  ctx.fillStyle = "#" + colorHex.toString(16).padStart(6, "0");
  ctx.font = "italic 13px Georgia";
  ctx.fillText(subtitle, 128, 58);

  const labelTex = new THREE.CanvasTexture(cvs);
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.3),
    new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide })
  );
  labelMesh.position.set(0, 0.45, 0.72);
  group.add(labelMesh);

  group.userData.pulseSpeed = 1.5;
  group.userData.pulseMeshes = [artifactObj];
  group.userData.artifactObj = artifactObj;

  return group;
}

export function createWorld(scene) {
  scene.background = new THREE.Color(PALETTE.abyss);
  scene.fog = new THREE.FogExp2(PALETTE.abyss, 0.028);

  const colliders = [];
  const pulseObjects = [];
  const jellies = [];

  scene.add(new THREE.AmbientLight(0x113344, 0.55));
  scene.add(new THREE.HemisphereLight(0x1c4d5e, 0x02060a, 0.5));

  const shaft = new THREE.DirectionalLight(0x4fd7c9, 0.5);
  shaft.position.set(4, 15, -6);
  scene.add(shaft);

  const causticLights = [
    new THREE.PointLight(PALETTE.teal, 5, 20),
    new THREE.PointLight(PALETTE.violet, 5, 20),
    new THREE.PointLight(PALETTE.coral, 4, 16),
  ];
  causticLights[0].position.set(-10, 4, 5);
  causticLights[1].position.set(10, 5, -5);
  causticLights[2].position.set(0, 3, 12);
  causticLights.forEach((l) => scene.add(l));

  const rockTex = makeRockTexture();
  const rockMat = new THREE.MeshStandardMaterial({
    color: PALETTE.rock,
    map: rockTex,
    roughness: 1,
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_HALF * 2, ROOM_HALF * 2),
    rockMat,
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  colliders.push(
    new THREE.Box3(
      new THREE.Vector3(-ROOM_HALF, -1, -ROOM_HALF),
      new THREE.Vector3(ROOM_HALF, 0, ROOM_HALF),
    ),
  );

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_HALF * 2, ROOM_HALF * 2),
    rockMat,
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = CAVE_H;
  scene.add(ceiling);
  colliders.push(
    new THREE.Box3(
      new THREE.Vector3(-ROOM_HALF, CAVE_H, -ROOM_HALF),
      new THREE.Vector3(ROOM_HALF, CAVE_H + 1, ROOM_HALF),
    ),
  );

  function addWall(w, h, d, x, y, z) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), rockMat);
    wall.position.set(x, y, z);
    scene.add(wall);
    colliders.push(new THREE.Box3().setFromObject(wall));
  }
  addWall(ROOM_HALF * 2, CAVE_H, 0.8, 0, CAVE_H / 2, -ROOM_HALF);
  addWall(ROOM_HALF * 2, CAVE_H, 0.8, 0, CAVE_H / 2, ROOM_HALF);
  addWall(0.8, CAVE_H, ROOM_HALF * 2, -ROOM_HALF, CAVE_H / 2, 0);
  addWall(0.8, CAVE_H, ROOM_HALF * 2, ROOM_HALF, CAVE_H / 2, 0);

  for (let i = 0; i < 40; i++) {
    const rock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.3 + Math.random() * 0.6, 0),
      rockMat,
    );
    const side = Math.floor(Math.random() * 4);
    const edge = ROOM_HALF - 0.3;
    const pos = [
      [
        THREE.MathUtils.randFloatSpread(ROOM_HALF * 2),
        Math.random() * CAVE_H,
        -edge,
      ],
      [
        THREE.MathUtils.randFloatSpread(ROOM_HALF * 2),
        Math.random() * CAVE_H,
        edge,
      ],
      [
        -edge,
        Math.random() * CAVE_H,
        THREE.MathUtils.randFloatSpread(ROOM_HALF * 2),
      ],
      [
        edge,
        Math.random() * CAVE_H,
        THREE.MathUtils.randFloatSpread(ROOM_HALF * 2),
      ],
    ][side];
    rock.position.set(...pos);
    rock.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    scene.add(rock);
  }

  const gallery = [
    {
      title: "Ikan Badut",
      subtitle: "Amphiprion ocellaris",
      color: PALETTE.coral,
      pos: [-ROOM_HALF + 0.5, 3.2, -10],
      rotY: Math.PI / 2,
      photo: "assets/clownfish.jpg",
    },
    {
      title: "Kuda Laut",
      subtitle: "Hippocampus sp.",
      color: PALETTE.teal,
      pos: [-ROOM_HALF + 0.5, 3.2, 0],
      rotY: Math.PI / 2,
      photo: "assets/seahorse.jpg",
    },
    {
      title: "Penyu Hijau",
      subtitle: "Chelonia mydas",
      color: PALETTE.green,
      pos: [-ROOM_HALF + 0.5, 3.2, 10],
      rotY: Math.PI / 2,
      photo: "assets/turtle.jpg",
    },
    {
      title: "Gurita",
      subtitle: "Octopus vulgaris",
      color: PALETTE.violet,
      pos: [ROOM_HALF - 0.5, 3.2, -10],
      rotY: -Math.PI / 2,
      photo: "assets/octopus.jpg",
    },
    {
      title: "Pari Manta",
      subtitle: "Mobula birostris",
      color: PALETTE.deep,
      pos: [ROOM_HALF - 0.5, 3.2, 0],
      rotY: -Math.PI / 2,
      photo: "assets/manta.jpg",
    },
    {
      title: "Ubur-ubur Bulan",
      subtitle: "Aurelia aurita",
      color: PALETTE.teal,
      pos: [ROOM_HALF - 0.5, 3.2, 10],
      rotY: -Math.PI / 2,
      photo: "assets/jellyfish.jpg",
    },
  ];
  gallery.forEach((g) => {
    const tablet = createSeaTablet(g.title, g.subtitle, g.color, g.photo);
    tablet.position.set(...g.pos);
    tablet.rotation.y = g.rotY;
    scene.add(tablet);
  });

  /* ---------- 5 MUSEUM GLASS CASES (5 DIFFERENT GEOMETRIES & UNIQUE COLORS) ---------- */
  const museumExhibits = [
    {
      type: "box",
      color: 0xffb703, // Amber Gold
      title: "📦 Kubus Energi Purba",
      subtitle: "Geometric Relic #1 (Box)",
      pos: [-10, 0, -5],
      rotY: Math.PI / 4,
    },
    {
      type: "sphere",
      color: 0x00f5d4, // Aquamarine Cyan
      title: "🔮 Orb Samudra Sanctum",
      subtitle: "Geometric Relic #2 (Sphere)",
      pos: [-10, 0, 5],
      rotY: -Math.PI / 4,
    },
    {
      type: "cylinder",
      color: 0xf72585, // Crimson Red
      title: "🏛️ Pilar Prasasti Kuil",
      subtitle: "Geometric Relic #3 (Cylinder)",
      pos: [10, 0, -5],
      rotY: -Math.PI / 4,
    },
    {
      type: "torus",
      color: 0x38b000, // Emerald Green
      title: "⭕ Cincin Kehidupan Laut",
      subtitle: "Geometric Relic #4 (Torus)",
      pos: [10, 0, 5],
      rotY: Math.PI / 4,
    },
    {
      type: "cone",
      color: 0x7209b7, // Royal Violet
      title: "🔺 Piramida Kristal Abyssal",
      subtitle: "Geometric Relic #5 (Cone)",
      pos: [-6, 0, 10],
      rotY: Math.PI / 6,
    },
  ];

  museumExhibits.forEach((e) => {
    const glassCase = createMuseumGlassCase(e.type, e.color, e.title, e.subtitle);
    glassCase.position.set(...e.pos);
    glassCase.rotation.y = e.rotY;
    scene.add(glassCase);
    pulseObjects.push(glassCase);
    colliders.push(
      new THREE.Box3(
        new THREE.Vector3(e.pos[0] - 0.7, 0, e.pos[2] - 0.7),
        new THREE.Vector3(e.pos[0] + 0.7, 2.4, e.pos[2] + 0.7)
      )
    );
  });

  const coralSpots = [
    [-8, 0, 6],
    [8, 0, 6],
    [-11, 0, -3],
    [11, 0, -3],
    [-5, 0, 12],
    [5, 0, 12],
    [8, 0, 12],
    [-6, 0, -10],
    [6, 0, -10],
  ];
  const coralColors = [
    PALETTE.coral,
    PALETTE.teal,
    PALETTE.violet,
    PALETTE.green,
  ];
  coralSpots.forEach(([x, y, z]) => {
    const cluster = createCoralCluster(
      coralColors[Math.floor(Math.random() * coralColors.length)],
    );
    cluster.position.set(x, y, z);
    scene.add(cluster);
    pulseObjects.push(cluster);
    colliders.push(
      new THREE.Box3(
        new THREE.Vector3(x - 0.9, 0, z - 0.9),
        new THREE.Vector3(x + 0.9, 3, z + 0.9),
      ),
    );
  });

  const jellySpots = [
    [-4, 3.5, -4],
    [5, 5, 2],
    [-9, 6, 8],
    [9, 4.2, -8],
    [-5, 7.5, -6],
    [-13, 4.5, 2],
    [13, 5.5, 6],
  ];
  const jellyColors = [
    PALETTE.teal,
    PALETTE.violet,
    PALETTE.coral,
    PALETTE.green,
  ];
  jellySpots.forEach(([x, y, z], i) => {
    const jelly = createJellyfish(jellyColors[i % jellyColors.length]);
    jelly.position.set(x, y, z);
    jelly.userData.baseY = y;
    scene.add(jelly);
    jellies.push(jelly);
  });

  /* ---------- Volumetric Oceanic Light Rays (God-Rays) ---------- */
  const rayGroup = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const rayMat = new THREE.MeshBasicMaterial({
      color: PALETTE.teal,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ray = new THREE.Mesh(new THREE.ConeGeometry(2.0 + Math.random(), CAVE_H, 16, 1, true), rayMat);
    ray.position.set(-12 + i * 5, CAVE_H / 2, -6 + (i % 3) * 4);
    ray.rotation.z = (Math.random() - 0.5) * 0.25;
    rayGroup.add(ray);
  }
  scene.add(rayGroup);

  /* ---------- Glowing Temple Walkway Pathway Tiles ---------- */
  for (let z = 13; z >= -6; z -= 3.2) {
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.05, 2.0),
      new THREE.MeshStandardMaterial({
        color: PALETTE.stone,
        emissive: PALETTE.teal,
        emissiveIntensity: 0.2,
        roughness: 0.8,
      })
    );
    tile.position.set(0, 0.02, z);
    scene.add(tile);

    const edgeGlow = new THREE.Mesh(
      new THREE.BoxGeometry(2.65, 0.06, 0.12),
      new THREE.MeshStandardMaterial({
        color: PALETTE.teal,
        emissive: PALETTE.teal,
        emissiveIntensity: 1.8,
      })
    );
    edgeGlow.position.set(0, 0.03, z + 0.95);
    scene.add(edgeGlow);
  }

  const stepCount = 9,
    stepH = 0.45,
    stepD = 0.9,
    stepW = 5;
  const startZ = -8;
  const stepMat = new THREE.MeshStandardMaterial({
    color: PALETTE.stone,
    roughness: 0.9,
    emissive: PALETTE.teal,
    emissiveIntensity: 0.05,
  });
  for (let i = 0; i < stepCount; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(stepW, stepH, stepD),
      stepMat,
    );
    step.position.set(0, stepH / 2 + i * stepH, startZ - i * stepD);
    scene.add(step);
    const glowEdge = new THREE.Mesh(
      new THREE.BoxGeometry(stepW, 0.03, 0.05),
      new THREE.MeshStandardMaterial({
        color: PALETTE.teal,
        emissive: PALETTE.teal,
        emissiveIntensity: 1.5,
      }),
    );
    glowEdge.position.set(
      0,
      stepH * (i + 1) + 0.02,
      startZ - i * stepD + stepD / 2 - 0.02,
    );
    scene.add(glowEdge);
  }

  const platformY = stepCount * stepH;
  const platformZ = startZ - stepCount * stepD - 3;
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6.6, 0.5, 24),
    new THREE.MeshStandardMaterial({ color: PALETTE.stone, roughness: 0.85 }),
  );
  platform.position.set(0, platformY - 0.25, platformZ);
  scene.add(platform);
  colliders.push(new THREE.Box3().setFromObject(platform));

  const relic = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.85, 0.26, 128, 16),
    new THREE.MeshStandardMaterial({
      color: PALETTE.violet,
      emissive: PALETTE.violet,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.6,
    }),
  );
  // Positioned on side wall pedestal completely clear of portal entrance
  relic.position.set(-14, 3.2, 0);
  relic.rotation.y = Math.PI / 2;
  scene.add(relic);
  const relicLight = new THREE.PointLight(PALETTE.violet, 6, 12);
  relicLight.position.copy(relic.position);
  scene.add(relicLight);
  pulseObjects.push({ userData: { pulseSpeed: 1.4, pulseMeshes: [relic] } });

  /* ---------- Portal Ancient Coral Gate (3D Circular Portal) ---------- */
  const portalGroup = new THREE.Group();
  portalGroup.position.set(0, platformY + 2.2, platformZ);

  // Pillar Structure
  const pillarMat = new THREE.MeshStandardMaterial({ color: PALETTE.stone, roughness: 0.9 });
  const pLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 4.8, 16), pillarMat);
  pLeft.position.set(-2.2, 0, 0);
  const pRight = pLeft.clone();
  pRight.position.set(2.2, 0, 0);
  portalGroup.add(pLeft, pRight);

  // Arch Header Beam
  const archBeam = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.5, 0.7), pillarMat);
  archBeam.position.set(0, 2.4, 0);
  portalGroup.add(archBeam);

  // Glowing Circular Portal Disc (Swirling Cyan-Violet Core)
  const portalDiscMat = new THREE.MeshBasicMaterial({
    color: PALETTE.teal,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide
  });
  const portalCore = new THREE.Mesh(new THREE.CircleGeometry(2.1, 40), portalDiscMat);
  portalCore.position.set(0, 0.2, 0);
  portalGroup.add(portalCore);

  // Outer & Inner Glowing Torus Rings
  const outerRingMat = new THREE.MeshStandardMaterial({ color: PALETTE.violet, emissive: PALETTE.violet, emissiveIntensity: 1.8 });
  const pRingOuter = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.09, 16, 48), outerRingMat);
  pRingOuter.position.set(0, 0.2, 0);
  portalGroup.add(pRingOuter);

  const innerRingMat = new THREE.MeshStandardMaterial({ color: PALETTE.teal, emissive: PALETTE.teal, emissiveIntensity: 2.0 });
  const pRingInner = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.06, 16, 48), innerRingMat);
  pRingInner.position.set(0, 0.2, 0.03);
  portalGroup.add(pRingInner);

  // PointLight for 3D Portal Glow
  const portalLight = new THREE.PointLight(PALETTE.teal, 6, 14);
  portalLight.position.set(0, 0.2, 0.6);
  portalGroup.add(portalLight);

  // 3D Canvas Label above Portal
  const pLabelCvs = document.createElement("canvas");
  pLabelCvs.width = 512; pLabelCvs.height = 128;
  const pCtx = pLabelCvs.getContext("2d");
  pCtx.fillStyle = "rgba(2, 10, 18, 0.88)";
  pCtx.fillRect(0, 0, 512, 128);
  pCtx.strokeStyle = "#2de6c9"; pCtx.lineWidth = 4;
  pCtx.strokeRect(6, 6, 500, 116);
  pCtx.fillStyle = "#2de6c9";
  pCtx.font = "bold 26px Georgia";
  pCtx.textAlign = "center";
  pCtx.fillText("🌀 PORTAL ANCIENT CORAL GATE", 256, 52);
  pCtx.fillStyle = "#8b5cf6";
  pCtx.font = "italic 19px Georgia";
  pCtx.fillText("➔ Berenang / Dekati Portal untuk Masuk Scene 2", 256, 90);
  const pTex = new THREE.CanvasTexture(pLabelCvs);

  const pLabelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 1.05),
    new THREE.MeshBasicMaterial({ map: pTex, transparent: true, side: THREE.DoubleSide })
  );
  pLabelMesh.position.set(0, 3.1, 0.1);
  portalGroup.add(pLabelMesh);

  scene.add(portalGroup);
  pulseObjects.push({ userData: { pulseSpeed: 2.2, pulseMeshes: [pRingOuter, pRingInner] } });

  const BUBBLE_COUNT = 260;
  const bubbleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(BUBBLE_COUNT * 3);
  const speeds = new Float32Array(BUBBLE_COUNT);
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    positions[i * 3] = THREE.MathUtils.randFloatSpread(ROOM_HALF * 2);
    positions[i * 3 + 1] = Math.random() * CAVE_H;
    positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(ROOM_HALF * 2);
    speeds[i] = 0.4 + Math.random() * 0.8;
  }
  bubbleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const bubbleMat = new THREE.PointsMaterial({
    color: 0xbfe9ff,
    size: 0.06,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const bubblePoints = new THREE.Points(bubbleGeo, bubbleMat);
  scene.add(bubblePoints);

  const bubbles = {
    points: bubblePoints,
    update(delta) {
      const pos = bubbleGeo.attributes.position;
      for (let i = 0; i < BUBBLE_COUNT; i++) {
        let y = pos.getY(i) + speeds[i] * delta;
        if (y > CAVE_H) y = 0;
        pos.setY(i, y);
        pos.setX(i, pos.getX(i) + Math.sin(y * 3 + i) * 0.004);
      }
      pos.needsUpdate = true;
    },
  };

  return { colliders, pulseObjects, jellies, bubbles, portalGate: portalGroup };
}
