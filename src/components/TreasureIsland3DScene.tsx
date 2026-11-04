/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { InteractableEntity, IslandZoneId } from '../types/game';
import { INTERACTABLE_ENTITIES, ISLAND_ZONES } from '../data/challenges';
import { sound } from '../utils/audio';

// Module-scope reusable math vectors (Zero GC in render loop)
const _vec3 = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _camIdealPos = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _playerForward = new THREE.Vector3();

// Island terrain elevation function
export function getIslandHeight(x: number, z: number): number {
  const dist = Math.sqrt(x * x + z * z);
  if (dist > 52) return -1.5; // In ocean water

  // Beach area in the south
  if (z > 25 && dist < 48) {
    return Math.max(0.2, (48 - dist) * 0.15);
  }

  // Mountain & Cave in North / Northwest
  if (z < -10 && x < 10) {
    const hill = Math.sin((x + 20) * 0.1) * Math.cos((z + 20) * 0.1) * 2;
    return Math.max(0.5, 4.0 + hill);
  }

  // Temple plateau in East
  if (x > 20 && z < 0) {
    return 3.2;
  }

  // Forest & Village gentle undulating hills
  const undulation = Math.sin(x * 0.15) * 0.8 + Math.cos(z * 0.15) * 0.8;
  return Math.max(0.6, 1.8 + undulation);
}

// Generate face texture for blocky Roblox explorer head
function createExplorerFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Face skin tone
  ctx.fillStyle = '#ffdfba';
  ctx.fillRect(0, 0, 128, 128);

  // Big friendly Roblox-style eyes
  ctx.fillStyle = '#1e293b';
  // Left eye
  ctx.beginPath();
  ctx.ellipse(38, 48, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Left eye glint
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(41, 44, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(90, 48, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right eye glint
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(93, 44, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Cheerful smile
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(64, 76, 22, 0.15 * Math.PI, 0.85 * Math.PI, false);
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.beginPath();
  ctx.arc(28, 70, 9, 0, Math.PI * 2);
  ctx.arc(100, 70, 9, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface TreasureIsland3DSceneProps {
  onInteract: (entity: InteractableEntity) => void;
  onCollectCoin: (coinId: string) => void;
  collectedCoinIds: string[];
  sealsUnlocked: number[];
  onPlayerPosChange: (pos: { x: number; z: number; angle: number; zone: IslandZoneId }) => void;
  teleportTargetZone?: IslandZoneId | null;
  onClearTeleportTarget?: () => void;
  isTouchDevice?: boolean;
}

export const TreasureIsland3DScene: React.FC<TreasureIsland3DSceneProps> = ({
  onInteract,
  onCollectCoin,
  collectedCoinIds,
  sealsUnlocked,
  onPlayerPosChange,
  teleportTargetZone,
  onClearTeleportTarget,
  isTouchDevice,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [nearbyEntity, setNearbyEntity] = useState<InteractableEntity | null>(null);

  // Player position state reference for fast loop updates
  const playerState = useRef({
    x: 0,
    y: 0.5,
    z: 38, // Start at Pantai Misteri
    vy: 0,
    rotY: Math.PI,
    speed: 0,
    isGrounded: true,
    isWalking: false,
    isRunning: false,
  });

  // Camera Orbit state
  const cameraOrbit = useRef({
    azimuth: 0,
    elevation: 0.38,
    distance: 9.0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  // Keyboard input states
  const keys = useRef<Record<string, boolean>>({});

  // Mobile / Touch controls state
  const touchState = useRef({
    moveX: 0,
    moveZ: 0,
    jump: false,
    run: false,
  });

  // Re-usable references to scene objects
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    playerGroup: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    coinsList: { id: string; mesh: THREE.Group; x: number; z: number }[];
    gateSealsMeshes: THREE.Mesh[];
  } | null>(null);

  // Handle Keydown & Keyup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyE') {
        if (nearbyEntity) {
          sound.playClick();
          onInteract(nearbyEntity);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyEntity, onInteract]);

  // Handle Teleportation
  useEffect(() => {
    if (teleportTargetZone) {
      const zone = ISLAND_ZONES.find((z) => z.id === teleportTargetZone);
      if (zone) {
        playerState.current.x = zone.coordinates.x;
        playerState.current.z = zone.coordinates.z;
        playerState.current.y = getIslandHeight(zone.coordinates.x, zone.coordinates.z) + 1.0;
        sound.playSealUnlock();
      }
      if (onClearTeleportTarget) onClearTeleportTarget();
    }
  }, [teleportTargetZone, onClearTeleportTarget]);

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Detect Software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7dd3fc); // Tropical clear sky
    scene.fog = new THREE.Fog(0x7dd3fc, 50, 160);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.2, 300);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Environment Lighting (RoomEnvironment reflection map)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x166534, 1.2);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffae0, 1.8);
    sunLight.position.set(45, 70, 35);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // -------------------------------------------------------------
    // PROCEDURAL 3D ISLAND WORLD CREATION
    // -------------------------------------------------------------

    // Ocean Water Plane
    const oceanGeo = new THREE.PlaneGeometry(350, 350, 24, 24);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = 0;
    scene.add(ocean);

    // Island Terrain Sculpted Mesh
    const terrainGeo = new THREE.PlaneGeometry(110, 110, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    const vertex = new THREE.Vector3();
    const colors = new Float32Array(posAttr.count * 3);

    for (let i = 0; i < posAttr.count; i++) {
      vertex.fromBufferAttribute(posAttr, i);
      const h = getIslandHeight(vertex.x, vertex.z);
      posAttr.setY(i, h);

      // Vertex Coloring based on height and zone
      const dist = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
      if (h < 0.6 || (vertex.z > 22 && dist < 50)) {
        // Sand Beach
        colors[i * 3] = 0.96;
        colors[i * 3 + 1] = 0.88;
        colors[i * 3 + 2] = 0.68;
      } else if (h > 3.0 && vertex.z < -10) {
        // Mountain rock
        colors[i * 3] = 0.45;
        colors[i * 3 + 1] = 0.45;
        colors[i * 3 + 2] = 0.48;
      } else {
        // Lush tropical grass
        colors[i * 3] = 0.18 + Math.random() * 0.05;
        colors[i * 3 + 1] = 0.65 + Math.random() * 0.08;
        colors[i * 3 + 2] = 0.22;
      }
    }
    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = !isSoftwareGl;
    scene.add(terrain);

    // -------------------------------------------------------------
    // PROCEDURAL ENVIRONMENT DECORATIONS
    // -------------------------------------------------------------

    // Helper: Composite 3D Palm Tree
    const createPalmTree = (x: number, z: number, scale = 1.0) => {
      const tree = new THREE.Group();
      const y = getIslandHeight(x, z);

      // Trunk (Segmented leaning trunk)
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });
      for (let i = 0; i < 5; i++) {
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28 - i * 0.03, 0.35 - i * 0.03, 1.1, 7),
          trunkMat
        );
        seg.position.set(Math.sin(i * 0.2) * 0.2, 0.55 + i * 1.0, 0);
        seg.rotation.z = 0.05 * i;
        seg.castShadow = !isSoftwareGl;
        tree.add(seg);
      }

      // Coconuts
      const nutMat = new THREE.MeshStandardMaterial({ color: 0x543310, roughness: 0.8 });
      for (let c = 0; c < 3; c++) {
        const nut = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), nutMat);
        nut.position.set(Math.cos(c * 2) * 0.25, 5.1, Math.sin(c * 2) * 0.25);
        tree.add(nut);
      }

      // Leaves/Fronds (8 palm leaves)
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        roughness: 0.6,
        side: THREE.DoubleSide,
      });
      for (let l = 0; l < 8; l++) {
        const angle = (l / 8) * Math.PI * 2;
        const frond = new THREE.Group();
        const leafMesh = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.2, 4), leafMat);
        leafMesh.position.set(0, 1.4, 0);
        leafMesh.rotation.x = Math.PI / 2.3;
        frond.add(leafMesh);
        frond.position.set(0, 5.2, 0);
        frond.rotation.y = angle;
        tree.add(frond);
      }

      tree.position.set(x, y, z);
      tree.scale.set(scale, scale, scale);
      scene.add(tree);
    };

    // Plant palm trees in beach and around the forest
    const treeLocations = [
      [-12, 36], [14, 38], [-24, 32], [22, 34], [-6, 44], [8, 42],
      [-30, 20], [-42, 16], [-28, 6], [-40, 4], [-34, 24],
      [24, 12], [40, 14], [28, 26], [38, 24],
      [18, -14], [26, -18], [42, -18],
    ];
    treeLocations.forEach(([tx, tz], idx) => {
      createPalmTree(tx, tz, 0.85 + (idx % 3) * 0.2);
    });

    // -------------------------------------------------------------
    // BIOME 1: PANTAI MISTERI (Spawn Point & Pier)
    // -------------------------------------------------------------
    // Wooden Dock/Pier
    const dock = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    for (let p = 0; p < 6; p++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 1.0), woodMat);
      plank.position.set(0, 0.6, 42 + p * 1.2);
      plank.castShadow = !isSoftwareGl;
      dock.add(plank);

      // Piling posts
      const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.0, 6), woodMat);
      postL.position.set(-1.3, -0.2, 42 + p * 1.2);
      dock.add(postL);
      const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.0, 6), woodMat);
      postR.position.set(1.3, -0.2, 42 + p * 1.2);
      dock.add(postR);
    }
    scene.add(dock);

    // Shipwreck Hull
    const wreck = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const hull = new THREE.Mesh(new THREE.BoxGeometry(4, 2.2, 9), hullMat);
    hull.rotation.z = 0.25;
    wreck.add(hull);
    // Broken Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6, 8), woodMat);
    mast.position.set(0, 2.8, 0);
    mast.rotation.z = -0.3;
    wreck.add(mast);
    wreck.position.set(-18, 0.8, 44);
    scene.add(wreck);

    // -------------------------------------------------------------
    // BIOME 2: HUTAN ANGKA (Ancient Math Monoliths)
    // -------------------------------------------------------------
    const forestMonolith = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const monolithPillar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 6.5, 2.4), stoneMat);
    monolithPillar.position.y = 3.25;
    monolithPillar.castShadow = !isSoftwareGl;
    forestMonolith.add(monolithPillar);

    // Glowing green equation inscription
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const runeGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), runeMat);
    runeGlow.position.set(0, 3.5, 1.21);
    forestMonolith.add(runeGlow);

    // Floating mathematical symbols around the monolith
    const symbolsGroup = new THREE.Group();
    const symMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x166534,
      roughness: 0.3,
    });
    for (let s = 0; s < 4; s++) {
      const symMesh = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.1, 8, 16), symMat);
      symMesh.position.set(Math.cos(s * 1.5) * 2.2, 4 + s * 0.5, Math.sin(s * 1.5) * 2.2);
      symbolsGroup.add(symMesh);
    }
    forestMonolith.add(symbolsGroup);
    forestMonolith.position.set(-36, getIslandHeight(-36, 12), 12);
    scene.add(forestMonolith);

    // -------------------------------------------------------------
    // BIOME 3: GUA PERSAMAAN (Neon Crystals & Gem Chest)
    // -------------------------------------------------------------
    const caveGroup = new THREE.Group();
    const caveRockMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.85 });
    // Cavern arch
    const archL = new THREE.Mesh(new THREE.BoxGeometry(3, 8, 3), caveRockMat);
    archL.position.set(-4, 4, 0);
    const archR = new THREE.Mesh(new THREE.BoxGeometry(3, 8, 3), caveRockMat);
    archR.position.set(4, 4, 0);
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(9, 2.5, 3.5), caveRockMat);
    archTop.position.set(0, 8, 0);
    caveGroup.add(archL, archR, archTop);

    // Glowing Crystal clusters (Amethyst & Sapphire)
    const crystalMatA = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x7e22ce,
      roughness: 0.2,
      metalness: 0.4,
    });
    const crystalMatB = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x1d4ed8,
      roughness: 0.2,
      metalness: 0.4,
    });
    for (let cr = 0; cr < 6; cr++) {
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.45 + (cr % 3) * 0.2, 0),
        cr % 2 === 0 ? crystalMatA : crystalMatB
      );
      crystal.position.set(Math.cos(cr) * 2.8, 1.2 + (cr % 3) * 0.4, Math.sin(cr) * 1.5);
      crystal.rotation.set(0.3 * cr, 0.4 * cr, 0.2 * cr);
      caveGroup.add(crystal);
    }
    caveGroup.position.set(-32, getIslandHeight(-32, -35), -35);
    scene.add(caveGroup);

    // -------------------------------------------------------------
    // BIOME 4: DESA PENJELAJAH (Stilt Huts & Market Stall)
    // -------------------------------------------------------------
    const village = new THREE.Group();
    // Stilt Hut 1
    const hut = new THREE.Group();
    // Stilts
    for (let st = 0; st < 4; st++) {
      const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.2, 6), woodMat);
      stilt.position.set((st % 2 === 0 ? -1 : 1) * 1.8, 1.1, (st < 2 ? -1 : 1) * 1.8);
      hut.add(stilt);
    }
    // Cabin Room
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 4.2), woodMat);
    cabin.position.set(0, 3.5, 0);
    hut.add(cabin);
    // Thatched Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 4), roofMat);
    roof.position.set(0, 5.8, 0);
    roof.rotation.y = Math.PI / 4;
    hut.add(roof);
    village.add(hut);

    // Market Stall
    const stall = new THREE.Group();
    const stallCounter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 1.2), woodMat);
    stallCounter.position.set(3.5, 0.5, 2.5);
    stall.add(stallCounter);
    // Water barrel & food crate
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.8, 8), woodMat);
    barrel.position.set(2.8, 0.4, 3.5);
    stall.add(barrel);
    village.add(stall);

    village.position.set(34, getIslandHeight(34, 18), 18);
    scene.add(village);

    // -------------------------------------------------------------
    // BIOME 5: KUIL MATEMATIKA (Temple Pillars & Altar)
    // -------------------------------------------------------------
    const temple = new THREE.Group();
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });

    // Temple Podium base
    const templeBase = new THREE.Mesh(new THREE.BoxGeometry(11, 1.2, 11), marbleMat);
    templeBase.position.y = 0.6;
    temple.add(templeBase);

    // 6 Columns
    for (let col = 0; col < 6; col++) {
      const colMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 5.5, 12), marbleMat);
      const colX = (col % 3 - 1) * 3.8;
      const colZ = col < 3 ? -3.8 : 3.8;
      colMesh.position.set(colX, 3.9, colZ);
      colMesh.castShadow = !isSoftwareGl;
      temple.add(colMesh);
    }

    // Pediment Roof
    const pedimentMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const pediment = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.9, 11.4), pedimentMat);
    pediment.position.y = 7.1;
    temple.add(pediment);

    // Center Holographic Cartesian Altar
    const altarBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 1.2, 8), marbleMat);
    altarBase.position.y = 1.8;
    temple.add(altarBase);

    // Holographic crystal plane on altar
    const holoPlaneMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x0f766e,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    const holoPlane = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 1.6), holoPlaneMat);
    holoPlane.position.y = 2.45;
    temple.add(holoPlane);

    temple.position.set(36, getIslandHeight(36, -25), -25);
    scene.add(temple);

    // -------------------------------------------------------------
    // BIOME 6: TREASURE CAVE (Grand 5-Seal Gate & Waterfall)
    // -------------------------------------------------------------
    const finalCave = new THREE.Group();
    // Massive Cavern Gate
    const gatePillarL = new THREE.Mesh(new THREE.BoxGeometry(3.5, 11, 4), caveRockMat);
    gatePillarL.position.set(-6, 5.5, 0);
    const gatePillarR = new THREE.Mesh(new THREE.BoxGeometry(3.5, 11, 4), caveRockMat);
    gatePillarR.position.set(6, 5.5, 0);
    const gateArch = new THREE.Mesh(new THREE.BoxGeometry(15, 3.5, 4.5), caveRockMat);
    gateArch.position.set(0, 11, 0);
    finalCave.add(gatePillarL, gatePillarR, gateArch);

    // Golden Waterfall Plane behind the gate
    const fallMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.2,
      metalness: 0.4,
      transparent: true,
      opacity: 0.7,
    });
    const waterfall = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), fallMat);
    waterfall.position.set(0, 5, -2);
    finalCave.add(waterfall);

    // 5 Seal Emblems on the archway
    const sealMeshes: THREE.Mesh[] = [];
    for (let sm = 0; sm < 5; sm++) {
      const sealMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.25, 8),
        new THREE.MeshStandardMaterial({
          color: sealsUnlocked.includes(sm + 1) ? 0xfacc15 : 0x475569,
          emissive: sealsUnlocked.includes(sm + 1) ? 0xca8a04 : 0x0f172a,
        })
      );
      sealMesh.rotation.x = Math.PI / 2;
      sealMesh.position.set((sm - 2) * 1.8, 8.8, 2.3);
      finalCave.add(sealMesh);
      sealMeshes.push(sealMesh);
    }

    // Legendary Golden Treasure Chest
    const chestGroup = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
    });
    const chestBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.2), goldMat);
    chestBase.position.y = 0.45;
    const chestLid = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.8, 12, 1, false, 0, Math.PI), goldMat);
    chestLid.rotation.z = Math.PI / 2;
    chestLid.position.set(0, 0.9, 0);
    chestGroup.add(chestBase, chestLid);
    chestGroup.position.set(0, 0.5, 2.8);
    finalCave.add(chestGroup);

    finalCave.position.set(0, getIslandHeight(0, -46), -46);
    scene.add(finalCave);

    // -------------------------------------------------------------
    // SCATTERED COLLECTABLE GOLD COINS (25 Coins)
    // -------------------------------------------------------------
    const coinsList: { id: string; mesh: THREE.Group; x: number; z: number }[] = [];
    const coinLocations = [
      { id: 'c1', x: -6, z: 38 },
      { id: 'c2', x: 6, z: 38 },
      { id: 'c3', x: 0, z: 46 },
      { id: 'c4', x: -16, z: 28 },
      { id: 'c5', x: -24, z: 22 },
      { id: 'c6', x: -32, z: 18 },
      { id: 'c7', x: -40, z: 10 },
      { id: 'c8', x: -30, z: 4 },
      { id: 'c9', x: -38, z: -8 },
      { id: 'c10', x: -34, z: -22 },
      { id: 'c11', x: -26, z: -32 },
      { id: 'c12', x: 12, z: 30 },
      { id: 'c13', x: 22, z: 24 },
      { id: 'c14', x: 28, z: 14 },
      { id: 'c15', x: 38, z: 10 },
      { id: 'c16', x: 32, z: 2 },
      { id: 'c17', x: 28, z: -10 },
      { id: 'c18', x: 34, z: -18 },
      { id: 'c19', x: 40, z: -30 },
      { id: 'c20', x: 16, z: -36 },
      { id: 'c21', x: 0, z: -25 },
      { id: 'c22', x: -8, z: -40 },
      { id: 'c23', x: 8, z: -40 },
      { id: 'c24', x: 0, z: -42 },
    ];

    const coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
    coinGeo.rotateX(Math.PI / 2);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x854d0e,
    });

    coinLocations.forEach((c) => {
      const cGroup = new THREE.Group();
      const cMesh = new THREE.Mesh(coinGeo, coinMat);
      cGroup.add(cMesh);
      const cy = getIslandHeight(c.x, c.z) + 0.9;
      cGroup.position.set(c.x, cy, c.z);
      scene.add(cGroup);
      coinsList.push({ id: c.id, mesh: cGroup, x: c.x, z: c.z });
    });

    // -------------------------------------------------------------
    // PROCEDURAL 3D ROBLOX-STYLE BLOCKY EXPLORER CHARACTER
    // -------------------------------------------------------------
    const playerGroup = new THREE.Group();

    // 1. Torso (Explorer Shirt & Pocket Straps)
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.5), torsoMat);
    torso.position.y = 1.45;
    torso.castShadow = !isSoftwareGl;
    playerGroup.add(torso);

    // Explorer Backpack on Torso back
    const packMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.35), packMat);
    backpack.position.set(0, 1.5, -0.38);
    backpack.castShadow = !isSoftwareGl;
    playerGroup.add(backpack);

    // 2. Head with Explorer Face Texture & Safari Hat
    const faceTex = createExplorerFaceTexture();
    const headMats = [
      new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.8 }), // right
      new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.8 }), // left
      new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.8 }), // top
      new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.8 }), // bottom
      new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.7 }), // front face
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 }), // back hair
    ];
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.65), headMats);
    head.position.y = 2.35;
    head.castShadow = !isSoftwareGl;
    playerGroup.add(head);

    // Safari Explorer Hat
    const hatGroup = new THREE.Group();
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.08, 16), hatMat);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 0.38, 16), hatMat);
    crown.position.y = 0.2;
    hatGroup.add(brim, crown);
    hatGroup.position.y = 2.75;
    playerGroup.add(hatGroup);

    // 3. Left Arm (Pivoted at shoulder)
    const armMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
    const handMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.8 });

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.62, 1.9, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.9, 0.36), armMat);
    leftArmMesh.position.y = -0.45;
    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.25, 0.3), handMat);
    leftHand.position.y = -0.95;
    leftArm.add(leftArmMesh, leftHand);
    playerGroup.add(leftArm);

    // 4. Right Arm (Pivoted at shoulder)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.62, 1.9, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.9, 0.36), armMat);
    rightArmMesh.position.y = -0.45;
    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.25, 0.3), handMat);
    rightHand.position.y = -0.95;
    rightArm.add(rightArmMesh, rightHand);
    playerGroup.add(rightArm);

    // 5. Left Leg (Pivoted at hip)
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.25, 0.9, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.75, 0.42), pantsMat);
    leftLegMesh.position.y = -0.38;
    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.5), bootMat);
    leftBoot.position.set(0, -0.78, 0.04);
    leftLeg.add(leftLegMesh, leftBoot);
    playerGroup.add(leftLeg);

    // 6. Right Leg (Pivoted at hip)
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.25, 0.9, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.75, 0.42), pantsMat);
    rightLegMesh.position.y = -0.38;
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.5), bootMat);
    rightBoot.position.set(0, -0.78, 0.04);
    rightLeg.add(rightLegMesh, rightBoot);
    playerGroup.add(rightLeg);

    // Place player at start
    playerGroup.position.set(playerState.current.x, playerState.current.y, playerState.current.z);
    scene.add(playerGroup);

    // Save refs
    sceneRef.current = {
      scene,
      camera,
      renderer,
      playerGroup,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      coinsList,
      gateSealsMeshes: sealMeshes,
    };

    // -------------------------------------------------------------
    // MOUSE & TOUCH ORBIT CAMERA LISTENERS
    // -------------------------------------------------------------
    const onMouseDown = (e: MouseEvent) => {
      // Right click or left click drag
      cameraOrbit.current.isDragging = true;
      cameraOrbit.current.lastX = e.clientX;
      cameraOrbit.current.lastY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!cameraOrbit.current.isDragging) return;
      const dx = e.clientX - cameraOrbit.current.lastX;
      const dy = e.clientY - cameraOrbit.current.lastY;
      cameraOrbit.current.lastX = e.clientX;
      cameraOrbit.current.lastY = e.clientY;

      cameraOrbit.current.azimuth -= dx * 0.005;
      cameraOrbit.current.elevation = Math.max(
        0.05,
        Math.min(1.2, cameraOrbit.current.elevation + dy * 0.005)
      );
    };

    const onMouseUp = () => {
      cameraOrbit.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      cameraOrbit.current.distance = Math.max(
        4.0,
        Math.min(16.0, cameraOrbit.current.distance + e.deltaY * 0.01)
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel);

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // ANIMATION & PHYSICS GAME LOOP
    // -------------------------------------------------------------
    let animFrameId = 0;
    const clock = new THREE.Clock();
    let animTime = 0;
    let stepSoundTimer = 0;

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      animTime += delta;

      // 1. Process Movement Inputs
      let inputX = 0;
      let inputZ = 0;

      if (keys.current['KeyW'] || keys.current['ArrowUp']) inputZ -= 1;
      if (keys.current['KeyS'] || keys.current['ArrowDown']) inputZ += 1;
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) inputX -= 1;
      if (keys.current['KeyD'] || keys.current['ArrowRight']) inputX += 1;

      // Combine with touch controls if active
      if (touchState.current.moveX !== 0 || touchState.current.moveZ !== 0) {
        inputX = touchState.current.moveX;
        inputZ = touchState.current.moveZ;
      }

      const isRunning =
        keys.current['ShiftLeft'] || keys.current['ShiftRight'] || touchState.current.run;
      const jumpRequested =
        keys.current['Space'] || touchState.current.jump;

      const moveLen = Math.sqrt(inputX * inputX + inputZ * inputZ);
      const isMoving = moveLen > 0.08;

      const baseSpeed = isRunning ? 10.5 : 6.0;

      // 2. Calculate Camera-Relative Movement Direction
      if (isMoving) {
        const normX = inputX / (moveLen || 1);
        const normZ = inputZ / (moveLen || 1);

        // Camera yaw angle
        const camYaw = cameraOrbit.current.azimuth;
        const forwardX = -Math.sin(camYaw);
        const forwardZ = -Math.cos(camYaw);
        const rightX = Math.cos(camYaw);
        const rightZ = -Math.sin(camYaw);

        _moveDir.set(
          normX * rightX + normZ * -forwardX,
          0,
          normX * rightZ + normZ * -forwardZ
        ).normalize();

        // Move Player
        playerState.current.x += _moveDir.x * baseSpeed * delta;
        playerState.current.z += _moveDir.z * baseSpeed * delta;

        // Island boundaries clamp
        const pDist = Math.sqrt(
          playerState.current.x * playerState.current.x +
          playerState.current.z * playerState.current.z
        );
        if (pDist > 50) {
          const ratio = 50 / pDist;
          playerState.current.x *= ratio;
          playerState.current.z *= ratio;
        }

        // Smooth character rotation toward movement direction
        const targetRotY = Math.atan2(_moveDir.x, _moveDir.z);
        let diff = targetRotY - playerState.current.rotY;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        playerState.current.rotY += diff * Math.min(1, delta * 14);

        // Footstep sound pacing
        stepSoundTimer += delta * (isRunning ? 1.5 : 1.0);
        if (stepSoundTimer > 0.38) {
          stepSoundTimer = 0;
          sound.playFootstep();
        }
      }

      // 3. Vertical Physics & Ground Collision
      const groundH = getIslandHeight(playerState.current.x, playerState.current.z);

      if (jumpRequested && playerState.current.isGrounded) {
        playerState.current.vy = 8.5;
        playerState.current.isGrounded = false;
        sound.playJump();
        if (touchState.current.jump) touchState.current.jump = false;
      }

      playerState.current.vy -= 22 * delta; // Gravity
      playerState.current.y += playerState.current.vy * delta;

      if (playerState.current.y <= groundH) {
        playerState.current.y = groundH;
        playerState.current.vy = 0;
        playerState.current.isGrounded = true;
      } else {
        playerState.current.isGrounded = false;
      }

      // Update Player Group position & rotation
      playerGroup.position.set(
        playerState.current.x,
        playerState.current.y,
        playerState.current.z
      );
      playerGroup.rotation.y = playerState.current.rotY;

      // 4. Procedural Arm & Leg Walking / Running Animation
      if (isMoving && playerState.current.isGrounded) {
        const animFreq = isRunning ? 16 : 10;
        const armAmp = isRunning ? 0.8 : 0.45;
        const legAmp = isRunning ? 0.9 : 0.55;

        leftArm.rotation.x = Math.sin(animTime * animFreq) * armAmp;
        rightArm.rotation.x = -Math.sin(animTime * animFreq) * armAmp;
        leftLeg.rotation.x = -Math.sin(animTime * animFreq) * legAmp;
        rightLeg.rotation.x = Math.sin(animTime * animFreq) * legAmp;
      } else if (!playerState.current.isGrounded) {
        // Airborne jump pose
        leftArm.rotation.x = -1.2;
        rightArm.rotation.x = -1.2;
        leftLeg.rotation.x = 0.5;
        rightLeg.rotation.x = -0.3;
      } else {
        // Idle gentle breathing sway
        leftArm.rotation.x = Math.sin(animTime * 2.5) * 0.05;
        rightArm.rotation.x = -Math.sin(animTime * 2.5) * 0.05;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
      }

      // 5. Smooth Third-Person Camera Follow
      _camTarget.set(
        playerState.current.x,
        playerState.current.y + 1.8,
        playerState.current.z
      );

      const orbitAzimuth = cameraOrbit.current.azimuth;
      const orbitElevation = cameraOrbit.current.elevation;
      const orbitDist = cameraOrbit.current.distance;

      const offX = Math.sin(orbitAzimuth) * Math.cos(orbitElevation) * orbitDist;
      const offY = Math.sin(orbitElevation) * orbitDist;
      const offZ = Math.cos(orbitAzimuth) * Math.cos(orbitElevation) * orbitDist;

      _camIdealPos.set(
        _camTarget.x + offX,
        _camTarget.y + offY,
        _camTarget.z + offZ
      );

      camera.position.copy(_camIdealPos);
      camera.lookAt(_camTarget);

      // 6. Animate Floating Symbols & Coins
      symbolsGroup.rotation.y += delta * 0.8;
      coinsList.forEach((c) => {
        c.mesh.rotation.z += delta * 3.0; // Spin coin
        c.mesh.position.y = getIslandHeight(c.x, c.z) + 0.9 + Math.sin(animTime * 4 + c.x) * 0.12;

        // Coin Pickup Detection
        if (!collectedCoinIds.includes(c.id)) {
          const dx = playerState.current.x - c.x;
          const dz = playerState.current.z - c.z;
          const cDist = Math.sqrt(dx * dx + dz * dz);
          if (cDist < 1.6) {
            c.mesh.visible = false;
            onCollectCoin(c.id);
          }
        } else {
          c.mesh.visible = false;
        }
      });

      // 7. Evaluate Proximity to Interactable Entities
      let closestEntity: InteractableEntity | null = null;
      let minEntityDist = 4.2;

      for (const ent of INTERACTABLE_ENTITIES) {
        const dx = playerState.current.x - ent.position[0];
        const dz = playerState.current.z - ent.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minEntityDist) {
          minEntityDist = dist;
          closestEntity = ent;
        }
      }
      setNearbyEntity(closestEntity);

      // 8. Determine Current Zone & Send Player Position to Parent
      let currentZId: IslandZoneId = 'beach';
      let minZoneDist = 999;
      for (const z of ISLAND_ZONES) {
        const dx = playerState.current.x - z.coordinates.x;
        const dz = playerState.current.z - z.coordinates.z;
        const zd = Math.sqrt(dx * dx + dz * dz);
        if (zd < minZoneDist) {
          minZoneDist = zd;
          currentZId = z.id;
        }
      }

      onPlayerPosChange({
        x: playerState.current.x,
        z: playerState.current.z,
        angle: playerState.current.rotY,
        zone: currentZId,
      });

      // Render Frame
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        // Pace loop on software WebGL
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            animFrameId = window.setTimeout(poll, 5);
          } else {
            gl.deleteSync(sync);
            animFrameId = window.setTimeout(tick, 70);
          }
        };
        animFrameId = window.setTimeout(poll, 5);
      } else {
        animFrameId = requestAnimationFrame(tick);
      }
    };

    tick();

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      clearTimeout(animFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, []); // Run once on mount

  // Virtual Joystick handlers for mobile/tablet
  const handleJoystickMove = (dx: number, dy: number) => {
    touchState.current.moveX = dx;
    touchState.current.moveZ = dy;
  };

  const handleJoystickEnd = () => {
    touchState.current.moveX = 0;
    touchState.current.moveZ = 0;
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Interaction Prompt when near NPC or Object */}
      {nearbyEntity && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={() => {
              sound.playClick();
              onInteract(nearbyEntity);
            }}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-xl shadow-amber-500/30 border-2 border-white transition transform active:scale-95 cursor-pointer"
          >
            <span className="w-6 h-6 rounded-lg bg-slate-950 text-white flex items-center justify-center font-mono text-xs font-bold">
              E
            </span>
            <span className="text-sm tracking-wide">{nearbyEntity.interactionPrompt}</span>
          </button>
          <span className="mt-1 text-[11px] font-mono font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
            {nearbyEntity.name}
          </span>
        </div>
      )}

      {/* Bottom Floating Control HUD for Touch / Tablet Devices */}
      <div className="absolute bottom-4 left-4 z-20 md:hidden flex items-end justify-between w-[calc(100%-32px)] pointer-events-none">
        {/* Virtual D-pad / Joystick */}
        <div className="pointer-events-auto flex flex-col items-center gap-1 bg-slate-950/70 p-2 rounded-2xl border border-slate-800 shadow-lg">
          <button
            onTouchStart={() => { touchState.current.moveZ = -1; }}
            onTouchEnd={() => { touchState.current.moveZ = 0; }}
            className="w-11 h-11 rounded-xl bg-slate-800 active:bg-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow"
          >
            ▲
          </button>
          <div className="flex items-center gap-1">
            <button
              onTouchStart={() => { touchState.current.moveX = -1; }}
              onTouchEnd={() => { touchState.current.moveX = 0; }}
              className="w-11 h-11 rounded-xl bg-slate-800 active:bg-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow"
            >
              ◀
            </button>
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700" />
            <button
              onTouchStart={() => { touchState.current.moveX = 1; }}
              onTouchEnd={() => { touchState.current.moveX = 0; }}
              className="w-11 h-11 rounded-xl bg-slate-800 active:bg-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow"
            >
              ▶
            </button>
          </div>
          <button
            onTouchStart={() => { touchState.current.moveZ = 1; }}
            onTouchEnd={() => { touchState.current.moveZ = 0; }}
            className="w-11 h-11 rounded-xl bg-slate-800 active:bg-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow"
          >
            ▼
          </button>
        </div>

        {/* Action Buttons: Jump, Run, Interact */}
        <div className="pointer-events-auto flex items-center gap-2">
          {nearbyEntity && (
            <button
              onClick={() => {
                sound.playClick();
                onInteract(nearbyEntity);
              }}
              className="w-13 h-13 rounded-2xl bg-amber-500 active:bg-amber-400 text-slate-950 font-black flex flex-col items-center justify-center shadow-lg border-2 border-white"
            >
              <span className="text-base font-bold">E</span>
              <span className="text-[9px]">AKSI</span>
            </button>
          )}

          <button
            onTouchStart={() => { touchState.current.run = true; }}
            onTouchEnd={() => { touchState.current.run = false; }}
            className="w-12 h-12 rounded-2xl bg-indigo-600 active:bg-indigo-500 text-white font-bold flex flex-col items-center justify-center shadow-lg border border-indigo-400"
          >
            <span className="text-xs">⚡</span>
            <span className="text-[9px]">LARI</span>
          </button>

          <button
            onTouchStart={() => { touchState.current.jump = true; }}
            className="w-14 h-14 rounded-2xl bg-cyan-500 active:bg-cyan-400 text-slate-950 font-black flex flex-col items-center justify-center shadow-lg border-2 border-white"
          >
            <span className="text-base">⬆</span>
            <span className="text-[10px]">LOMPAT</span>
          </button>
        </div>
      </div>

      {/* Desktop Keyboard Controls Overlay Guide (Bottom Left) */}
      <div className="hidden md:flex absolute bottom-4 left-4 z-10 items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-md">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white border border-slate-700">W</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white border border-slate-700">A</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white border border-slate-700">S</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white border border-slate-700">D</kbd>
          Gerak
        </span>
        <span className="text-slate-600">&bull;</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white border border-slate-700">SPACE</kbd>
          Lompat
        </span>
        <span className="text-slate-600">&bull;</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white border border-slate-700">SHIFT</kbd>
          Lari
        </span>
        <span className="text-slate-600">&bull;</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">E</kbd>
          Interaksi
        </span>
        <span className="text-slate-600">&bull;</span>
        <span className="text-slate-400">Mouse Drag Putar Kamera</span>
      </div>
    </div>
  );
};
