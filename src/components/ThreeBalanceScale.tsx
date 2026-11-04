/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ScaleState, GameLevelId, ItemType } from '../types/game';
import { sound } from '../utils/audio';
import {
  createBoxXTexture,
  createBoxYTexture,
  createGoldBarTexture,
  createWeightBadgeTexture,
  buildItemMesh,
  decomposeWeightToItems,
} from '../utils/threeScaleAssets';
import { Sparkles, CheckCircle2, Bot, Scale, Zap } from 'lucide-react';

interface ThreeBalanceScaleProps {
  scale1: ScaleState;
  scale2?: ScaleState;
  secretX: number;
  secretY: number;
  activeScaleFocus?: 'all' | 'scale1' | 'scale2';
  onScaleFocusChange?: (focus: 'all' | 'scale1' | 'scale2') => void;
  showValuesRevealed?: boolean;
  levelId?: GameLevelId;
  onDropItem?: (pan: 'left' | 'right', itemType: ItemType) => void;
}

export const ThreeBalanceScale: React.FC<ThreeBalanceScaleProps> = ({
  scale1,
  scale2,
  secretX,
  secretY,
  activeScaleFocus = 'all',
  onScaleFocusChange,
  showValuesRevealed = false,
  levelId = 1,
  onDropItem,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDragOverLeft, setIsDragOverLeft] = useState(false);
  const [isDragOverRight, setIsDragOverRight] = useState(false);
  const [showEquilibriumBanner, setShowEquilibriumBanner] = useState(false);
  const [activeScaleTab, setActiveScaleTab] = useState<'scale1' | 'scale2'>('scale1');

  const currentScale = activeScaleTab === 'scale1' || !scale2 ? scale1 : scale2;

  // Calculate live pan masses
  const leftMass =
    currentScale.leftPan.xCount * secretX +
    currentScale.leftPan.yCount * secretY +
    currentScale.leftPan.constantWeight;
  const rightMass =
    currentScale.rightPan.xCount * secretX +
    currentScale.rightPan.yCount * secretY +
    currentScale.rightPan.constantWeight;
  const massDiff = rightMass - leftMass;
  const isScaleBalanced = Math.abs(massDiff) < 0.001;

  // State ref for animation loop
  const stateRef = useRef({
    scale1,
    scale2,
    secretX,
    secretY,
    activeScaleFocus,
    showValuesRevealed,
    levelId,
    activeScaleTab,
  });

  useEffect(() => {
    stateRef.current = {
      scale1,
      scale2,
      secretX,
      secretY,
      activeScaleFocus,
      showValuesRevealed,
      levelId,
      activeScaleTab,
    };
  }, [scale1, scale2, secretX, secretY, activeScaleFocus, showValuesRevealed, levelId, activeScaleTab]);

  // Equilibrium banner display trigger
  useEffect(() => {
    if (isScaleBalanced) {
      setShowEquilibriumBanner(true);
      const timer = setTimeout(() => setShowEquilibriumBanner(false), 3500);
      return () => clearTimeout(timer);
    } else {
      setShowEquilibriumBanner(false);
    }
  }, [isScaleBalanced, scale1, scale2]);

  const wasBalancedRef = useRef<{ scale1: boolean; scale2: boolean }>({
    scale1: false,
    scale2: false,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 850;
    let height = container.clientHeight || 520;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene with theme-specific background
    const scene = new THREE.Scene();

    // Theme color palette per level
    const getThemeColors = (lvl: GameLevelId) => {
      switch (lvl) {
        case 1: // Blue Laboratory
          return { bg: 0x070e1d, fog: 0x070e1d, grid1: 0x06b6d4, grid2: 0x0c2547, accent: 0x38bdf8 };
        case 2: // Purple Mystery
          return { bg: 0x110722, fog: 0x110722, grid1: 0xd946ef, grid2: 0x2b0d4d, accent: 0xf472b6 };
        case 3: // Golden Balance
          return { bg: 0x160f06, fog: 0x160f06, grid1: 0xfbbf24, grid2: 0x3d280d, accent: 0xfacc15 };
        case 4: // Neon Mathematics
          return { bg: 0x05180f, fog: 0x05180f, grid1: 0x10b981, grid2: 0x0b3520, accent: 0x34d399 };
        case 5: // Rainbow Challenge
        default:
          return { bg: 0x0b0b1e, fog: 0x0b0b1e, grid1: 0x818cf8, grid2: 0x1e1e4a, accent: 0xa78bfa };
      }
    };

    const initialTheme = getThemeColors(levelId);
    scene.background = new THREE.Color(initialTheme.bg);
    scene.fog = new THREE.FogExp2(initialTheme.fog, 0.022);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 4.4, 11.5);
    camera.lookAt(0, 1.4, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting rig: Studio 3-point + colorful rim lighting
    const ambientLight = new THREE.HemisphereLight(0xa5c9ff, 0x161c2e, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(6, 12, 8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 30;
      keyLight.shadow.camera.left = -11;
      keyLight.shadow.camera.right = 11;
      keyLight.shadow.camera.top = 10;
      keyLight.shadow.camera.bottom = -4;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    fillLight.position.set(-8, 6, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd946ef, 1.4);
    rimLight.position.set(0, 7, -10);
    scene.add(rimLight);

    // --- FUTURISTIC MATH LAB ENVIRONMENT ---

    // 1. Neon Grid Floor
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.75,
      metalness: 0.35,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.01;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    const gridHelper = new THREE.GridHelper(32, 32, initialTheme.grid1, initialTheme.grid2);
    gridHelper.position.y = 0.015;
    scene.add(gridHelper);

    // 2. Futuristic Storage Shelves in Background
    const buildLabShelves = () => {
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(0, 2.2, -6.5);

      // Shelving frame uprights (neon tubes)
      const uprightGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.4, 16);
      const uprightMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.2,
      });

      const xPositions = [-5.5, -2, 2, 5.5];
      xPositions.forEach((xp) => {
        const pole = new THREE.Mesh(uprightGeo, uprightMat);
        pole.position.x = xp;
        shelfGroup.add(pole);
      });

      // Horizontal glass shelves
      const shelfPlankGeo = new THREE.BoxGeometry(11.4, 0.08, 1.2);
      const shelfPlankMat = new THREE.MeshStandardMaterial({
        color: 0x0e1726,
        roughness: 0.1,
        metalness: 0.7,
        transparent: true,
        opacity: 0.85,
      });

      [-1.2, 0.1, 1.4].forEach((yp) => {
        const plank = new THREE.Mesh(shelfPlankGeo, shelfPlankMat);
        plank.position.y = yp;
        shelfGroup.add(plank);

        // Neon edge strip under shelf
        const stripGeo = new THREE.BoxGeometry(11.4, 0.03, 0.05);
        const stripMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        strip.position.set(0, yp - 0.05, 0.6);
        shelfGroup.add(strip);
      });

      // Decorative items on shelves: Glowing canisters, mystery cubes, sample flasks
      const canisterGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.65, 16);
      const canisterMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });

      [-4.2, -3.5, 3.2, 4.0].forEach((xp, i) => {
        const can = new THREE.Mesh(canisterGeo, canisterMat);
        can.position.set(xp, -1.2 + 0.35, 0);
        can.rotation.y = i * 0.4;
        shelfGroup.add(can);
      });

      const sphereDecoGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const sphereDecoMat = new THREE.MeshStandardMaterial({
        color: 0xd946ef,
        emissive: 0xa21caf,
        emissiveIntensity: 0.5,
        roughness: 0.15,
      });
      [-1.2, 0.8].forEach((xp) => {
        const orb = new THREE.Mesh(sphereDecoGeo, sphereDecoMat);
        orb.position.set(xp, 0.1 + 0.25, 0);
        shelfGroup.add(orb);
      });

      return shelfGroup;
    };

    const labShelves = buildLabShelves();
    scene.add(labShelves);

    // 3. Floating Holographic Info Screens
    const buildHoloScreen = (xPos: number, yPos: number, title: string, formula: string) => {
      const group = new THREE.Group();
      group.position.set(xPos, yPos, -4);
      group.rotation.y = xPos > 0 ? -0.35 : 0.35;

      const screenGeo = new THREE.PlaneGeometry(2.4, 1.4);
      const canvas = document.createElement('canvas');
      canvas.width = 384;
      canvas.height = 224;
      const ctx = canvas.getContext('2d')!;

      // Transparent sci-fi blue background
      ctx.fillStyle = 'rgba(6, 25, 50, 0.85)';
      ctx.fillRect(0, 0, 384, 224);

      // Cyan neon frame
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 372, 212);

      // Header line
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(10, 10, 364, 38);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(title, 22, 36);

      // Formula text
      ctx.fillStyle = '#a5f3fc';
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(formula, 192, 115);

      // Bottom status bar
      ctx.fillStyle = '#38bdf8';
      ctx.font = '16px monospace';
      ctx.fillText('STATUS: AKTIF &middot; SIMULASI SPLDV', 192, 185);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(screenGeo, mat);
      group.add(mesh);
      return group;
    };

    const holoScreenLeft = buildHoloScreen(-5.2, 3.4, 'SISTEM 1: MODEL', 'ax + by = c');
    const holoScreenRight = buildHoloScreen(5.2, 3.4, 'SENSOR: STATUS', 'Δm = m₁ - m₂');
    scene.add(holoScreenLeft);
    scene.add(holoScreenRight);

    // 4. Floating Animated Math Symbols in Background (+, -, =, x, y)
    const floatingSymbols: THREE.Group[] = [];
    const symbolChars = ['+', '-', '=', 'x', 'y', '∑', 'Δ'];
    symbolChars.forEach((char, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = idx % 2 === 0 ? '#38bdf8' : '#e879f9';
      ctx.font = 'bold 72px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 64, 64);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const geo = new THREE.PlaneGeometry(0.7, 0.7);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);

      const symGroup = new THREE.Group();
      symGroup.add(mesh);
      const angle = (idx / symbolChars.length) * Math.PI * 2;
      symGroup.position.set(Math.cos(angle) * 7.5, 2.5 + Math.sin(idx) * 1.5, -4.5 + Math.sin(angle) * 1.5);
      scene.add(symGroup);
      floatingSymbols.push(symGroup);
    });

    // 5. Cute 3D Companion Robot ("Byte" / "Equi-Bot")
    const botGroup = new THREE.Group();
    botGroup.position.set(4.6, 2.6, 0.8);
    scene.add(botGroup);

    // Robot body (floating sphere)
    const botBodyGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const botBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.7,
      roughness: 0.15,
    });
    const botBody = new THREE.Mesh(botBodyGeo, botBodyMat);
    botGroup.add(botBody);

    // Robot visor screen with glowing LED eyes
    const botVisorGeo = new THREE.SphereGeometry(0.38, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const botVisorMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const botVisor = new THREE.Mesh(botVisorGeo, botVisorMat);
    botVisor.rotation.x = Math.PI * 0.55;
    botVisor.position.set(0, 0.05, 0.08);
    botGroup.add(botVisor);

    // Expressive glowing eyes
    const eyeGeo = new THREE.CapsuleGeometry(0.04, 0.09, 8, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.12, 0.06, 0.41);
    leftEye.rotation.z = 0.1;
    botGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.12, 0.06, 0.41);
    rightEye.rotation.z = -0.1;
    botGroup.add(rightEye);

    // Cute antenna with glowing top orb
    const antStemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
    const antStemMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.1 });
    const antStem = new THREE.Mesh(antStemGeo, antStemMat);
    antStem.position.y = 0.52;
    botGroup.add(antStem);

    const antOrbGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const antOrbMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const antOrb = new THREE.Mesh(antOrbGeo, antOrbMat);
    antOrb.position.y = 0.65;
    botGroup.add(antOrb);

    // Small propulsion ring below bot
    const propGeo = new THREE.TorusGeometry(0.2, 0.035, 12, 24);
    const propMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const propRing = new THREE.Mesh(propGeo, propMat);
    propRing.rotation.x = Math.PI / 2;
    propRing.position.y = -0.42;
    botGroup.add(propRing);

    // 6. Celebratory Particle System for Equilibrium (Rising Glowing Stars)
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number; life: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 1] = 0.5 + Math.random() * 3;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: 0.015 + Math.random() * 0.03,
        z: (Math.random() - 0.5) * 0.02,
        life: Math.random(),
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle Star Texture
    const starTexCanvas = document.createElement('canvas');
    starTexCanvas.width = 64;
    starTexCanvas.height = 64;
    const sCtx = starTexCanvas.getContext('2d')!;
    sCtx.fillStyle = '#fbbf24';
    sCtx.beginPath();
    sCtx.arc(32, 32, 26, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.fillStyle = '#ffffff';
    sCtx.beginPath();
    sCtx.arc(32, 32, 14, 0, Math.PI * 2);
    sCtx.fill();
    const starParticleTex = new THREE.CanvasTexture(starTexCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.28,
      map: starParticleTex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- PROCEDURAL TEXTURES FOR 3D OBJECTS ---
    const texMap = {
      boxX: createBoxXTexture(renderer),
      boxY: createBoxYTexture(renderer),
      goldBar: createGoldBarTexture(),
      badge1: createWeightBadgeTexture('1kg', '#334155'),
      badge3: createWeightBadgeTexture('3kg', '#854d0e'),
      badge4: createWeightBadgeTexture('4kg', '#064e3b'),
      badge5: createWeightBadgeTexture('5kg', '#881337'),
      badge6: createWeightBadgeTexture('6kg', '#0c4a6e'),
      badge10: createWeightBadgeTexture('10kg', '#4c1d95'),
    };

    // Shared scale materials
    // Modern Turquoise / Electric Blue Scale Frame Material
    const scaleFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.88,
      roughness: 0.2,
      emissive: 0x0369a1,
      emissiveIntensity: 0.25,
    });

    const scaleChromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
    });

    const darkBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.35,
    });

    // Mangkuk Kiri: Turquoise / Cyan neon bowl
    const leftBowlMaterial = new THREE.MeshStandardMaterial({
      color: 0x083344,
      metalness: 0.65,
      roughness: 0.18,
      emissive: 0x0891b2,
      emissiveIntensity: 0.2,
    });

    // Mangkuk Kanan: Magenta / Purple neon bowl
    const rightBowlMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a044e,
      metalness: 0.65,
      roughness: 0.18,
      emissive: 0xa855f7,
      emissiveIntensity: 0.2,
    });

    // --- PROCEDURAL 3D BALANCE SCALE RIG BUILDER ---
    const createScaleRig = (xOffset: number, scaleLabel: string) => {
      const rootGroup = new THREE.Group();
      rootGroup.position.x = xOffset;
      scene.add(rootGroup);

      // 1. Futuristic Stepped Plinth Base
      const baseLowerGeo = new THREE.CylinderGeometry(1.85, 2.1, 0.22, 36);
      const baseLower = new THREE.Mesh(baseLowerGeo, darkBaseMaterial);
      baseLower.position.y = 0.11;
      baseLower.receiveShadow = !isSoftwareGl;
      baseLower.castShadow = !isSoftwareGl;
      rootGroup.add(baseLower);

      // Glowing Neon Base Rim (Turquoise)
      const baseRimGeo = new THREE.TorusGeometry(1.92, 0.05, 12, 36);
      const baseRimMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const baseRim = new THREE.Mesh(baseRimGeo, baseRimMat);
      baseRim.rotation.x = Math.PI / 2;
      baseRim.position.y = 0.22;
      rootGroup.add(baseRim);

      const baseUpperGeo = new THREE.CylinderGeometry(1.35, 1.55, 0.2, 32);
      const baseUpper = new THREE.Mesh(baseUpperGeo, scaleFrameMaterial);
      baseUpper.position.y = 0.32;
      baseUpper.castShadow = !isSoftwareGl;
      rootGroup.add(baseUpper);

      // 2. High-Tech Fluted Vertical Column
      const columnGeo = new THREE.CylinderGeometry(0.28, 0.36, 2.8, 24);
      const column = new THREE.Mesh(columnGeo, darkBaseMaterial);
      column.position.y = 1.75;
      column.castShadow = !isSoftwareGl;
      rootGroup.add(column);

      // Vertical neon power conduits running up the column
      [-0.32, 0.32].forEach((xp) => {
        const conduitGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.6, 8);
        const conduitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const conduit = new THREE.Mesh(conduitGeo, conduitMat);
        conduit.position.set(xp, 1.75, 0.15);
        rootGroup.add(conduit);
      });

      // 3. Central Pivot Hub & Protractor Arc Dial
      const hubGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.42, 32);
      const hub = new THREE.Mesh(hubGeo, scaleFrameMaterial);
      hub.rotation.x = Math.PI / 2;
      hub.position.y = 3.2;
      rootGroup.add(hub);

      // Chrome pivot pin
      const pinGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.48, 24);
      const pin = new THREE.Mesh(pinGeo, scaleChromeMaterial);
      pin.rotation.x = Math.PI / 2;
      pin.position.y = 3.2;
      rootGroup.add(pin);

      // Balance Indicator LED Beacon atop main column
      const beaconGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 3.85, 0);
      rootGroup.add(beacon);

      const beaconLight = new THREE.PointLight(0xef4444, 1.5, 3.5);
      beaconLight.position.set(0, 3.85, 0.2);
      rootGroup.add(beaconLight);

      // Digital Dial Plate Behind Hub
      const dialPlateGeo = new THREE.PlaneGeometry(1.8, 0.55);
      const dialCanvas = document.createElement('canvas');
      dialCanvas.width = 360;
      dialCanvas.height = 110;
      const dialCtx = dialCanvas.getContext('2d')!;

      const updateDialTexture = (text: string, isEquilibrium: boolean) => {
        dialCtx.fillStyle = '#090d16';
        dialCtx.fillRect(0, 0, 360, 110);
        dialCtx.strokeStyle = isEquilibrium ? '#10b981' : '#38bdf8';
        dialCtx.lineWidth = 5;
        dialCtx.strokeRect(5, 5, 350, 100);

        dialCtx.fillStyle = isEquilibrium ? '#10b981' : '#38bdf8';
        dialCtx.font = 'bold 24px "JetBrains Mono", monospace';
        dialCtx.textAlign = 'center';
        dialCtx.fillText(scaleLabel, 180, 42);

        dialCtx.font = 'bold 20px monospace';
        dialCtx.fillStyle = isEquilibrium ? '#4ade80' : '#f59e0b';
        dialCtx.fillText(text, 180, 85);
      };

      updateDialTexture('SIAP MEMERIKSA', false);
      const dialTex = new THREE.CanvasTexture(dialCanvas);
      dialTex.colorSpace = THREE.SRGBColorSpace;
      const dialMat = new THREE.MeshBasicMaterial({ map: dialTex });
      const dialPlate = new THREE.Mesh(dialPlateGeo, dialMat);
      dialPlate.position.set(0, 2.5, 0.32);
      rootGroup.add(dialPlate);

      // Protractor Scale Arc above Hub
      const arcGeo = new THREE.RingGeometry(0.75, 0.82, 32, 1, Math.PI * 0.25, Math.PI * 0.5);
      const arcMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
      const arcRing = new THREE.Mesh(arcGeo, arcMat);
      arcRing.position.set(0, 3.2, 0.25);
      rootGroup.add(arcRing);

      // 4. Dynamic Pivot Group (Crossbeam + Indicator Needle)
      const beamPivot = new THREE.Group();
      beamPivot.position.set(0, 3.2, 0);
      rootGroup.add(beamPivot);

      // Sleek Modern Beam Arm (Rangka Timbangan)
      const armLength = 5.6;
      const armHalf = armLength / 2;
      const armGeo = new THREE.BoxGeometry(armLength, 0.22, 0.18);
      const beam = new THREE.Mesh(armGeo, scaleFrameMaterial);
      beam.castShadow = !isSoftwareGl;
      beamPivot.add(beam);

      // Top Neon Stripe along the beam
      const beamStripeGeo = new THREE.BoxGeometry(armLength * 0.94, 0.04, 0.06);
      const beamStripeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const beamStripe = new THREE.Mesh(beamStripeGeo, beamStripeMat);
      beamStripe.position.y = 0.12;
      beamPivot.add(beamStripe);

      // Central Indicator Needle pointing up to the arc dial
      const needleGeo = new THREE.ConeGeometry(0.06, 0.72, 16);
      const needleMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xeab308,
        emissiveIntensity: 0.4,
      });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.y = 0.38;
      beamPivot.add(needle);

      // Hooks at arm ends
      const hookGeo = new THREE.TorusGeometry(0.14, 0.035, 12, 24, Math.PI * 1.5);
      const leftHook = new THREE.Mesh(hookGeo, scaleChromeMaterial);
      leftHook.position.set(-armHalf, 0, 0);
      leftHook.rotation.z = Math.PI * 0.25;
      beamPivot.add(leftHook);

      const rightHook = leftHook.clone();
      rightHook.position.set(armHalf, 0, 0);
      beamPivot.add(rightHook);

      // 5. Left Pan Rig (Suspended Mangkuk Kiri)
      const leftPanPivot = new THREE.Group();
      leftPanPivot.position.set(-armHalf, 0, 0);
      beamPivot.add(leftPanPivot);

      const rodLength = 1.65;
      const createBowlSuspension = (bowlMat: THREE.Material, rimColor: number) => {
        const group = new THREE.Group();
        const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, rodLength, 8);
        const rodMat = scaleChromeMaterial;

        // 3 Suspension Rods
        const r1 = new THREE.Mesh(rodGeo, rodMat);
        r1.position.set(0, -rodLength / 2, 0.55);
        r1.rotation.x = 0.32;
        group.add(r1);

        const r2 = new THREE.Mesh(rodGeo, rodMat);
        r2.position.set(-0.5, -rodLength / 2, -0.3);
        r2.rotation.z = 0.3;
        r2.rotation.x = -0.18;
        group.add(r2);

        const r3 = new THREE.Mesh(rodGeo, rodMat);
        r3.position.set(0.5, -rodLength / 2, -0.3);
        r3.rotation.z = -0.3;
        r3.rotation.x = -0.18;
        group.add(r3);

        // Mangkuk Timbangan 3D (Curved Concave Bowl)
        const bowlGeo = new THREE.CylinderGeometry(1.25, 0.85, 0.35, 32);
        const bowl = new THREE.Mesh(bowlGeo, bowlMat);
        bowl.position.y = -rodLength;
        bowl.castShadow = !isSoftwareGl;
        bowl.receiveShadow = !isSoftwareGl;
        group.add(bowl);

        // Glowing Neon Bowl Rim
        const rimGeo = new THREE.TorusGeometry(1.26, 0.05, 12, 36);
        const rimMat = new THREE.MeshBasicMaterial({ color: rimColor });
        const rimMesh = new THREE.Mesh(rimGeo, rimMat);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = -rodLength + 0.17;
        group.add(rimMesh);

        // Inner tray surface where items rest
        const itemsGroup = new THREE.Group();
        itemsGroup.position.y = -rodLength + 0.2;
        group.add(itemsGroup);

        return { group, itemsGroup, rimMesh, rimMat };
      };

      const leftPanData = createBowlSuspension(leftBowlMaterial, 0x06b6d4);
      leftPanPivot.add(leftPanData.group);

      // 6. Right Pan Rig (Suspended Mangkuk Kanan)
      const rightPanPivot = new THREE.Group();
      rightPanPivot.position.set(armHalf, 0, 0);
      beamPivot.add(rightPanPivot);

      const rightPanData = createBowlSuspension(rightBowlMaterial, 0xd946ef);
      rightPanPivot.add(rightPanData.group);

      // Dynamic Digital Mass Tag floating above each pan
      const createMassTag = (xPos: number) => {
        const tagGeo = new THREE.PlaneGeometry(1.1, 0.4);
        const canvas = document.createElement('canvas');
        canvas.width = 220;
        canvas.height = 80;
        const ctx = canvas.getContext('2d')!;

        const updateTag = (text: string, color: string) => {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(0, 0, 220, 80);
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.strokeRect(4, 4, 212, 72);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, 110, 42);
        };

        updateTag('0 kg', '#38bdf8');
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(tagGeo, mat);
        mesh.position.set(xPos, 0.35, 0);
        return { mesh, tex, updateTag };
      };

      const leftTag = createMassTag(0);
      leftPanData.group.add(leftTag.mesh);

      const rightTag = createMassTag(0);
      rightPanData.group.add(rightTag.mesh);

      // Contact shadow planes
      const shadowGeo = new THREE.PlaneGeometry(2.6, 2.6);
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const sCtx = shadowCanvas.getContext('2d')!;
      const radGrad = sCtx.createRadialGradient(64, 64, 5, 64, 64, 60);
      radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      radGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = radGrad;
      sCtx.fillRect(0, 0, 128, 128);
      const shadowTex = new THREE.CanvasTexture(shadowCanvas);

      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.65,
      });

      const leftShadow = new THREE.Mesh(shadowGeo, shadowMat);
      leftShadow.rotation.x = -Math.PI / 2;
      leftShadow.position.set(-armHalf, 0.02, 0);
      rootGroup.add(leftShadow);

      const rightShadow = leftShadow.clone();
      rightShadow.position.x = armHalf;
      rootGroup.add(rightShadow);

      return {
        rootGroup,
        beamPivot,
        leftPanPivot,
        rightPanPivot,
        leftItemsGroup: leftPanData.itemsGroup,
        rightItemsGroup: rightPanData.itemsGroup,
        leftBowlRim: leftPanData.rimMat,
        rightBowlRim: rightPanData.rimMat,
        beaconMat,
        beaconLight,
        dialTex,
        updateDialTexture,
        leftTag,
        rightTag,
        armHalf,
        currentAngle: 0,
        targetAngle: 0,
      };
    };

    // Instantiate Scales
    const hasScale2 = Boolean(scale2);
    const scale1Offset = hasScale2 ? -3.5 : 0;
    const scale2Offset = hasScale2 ? 3.5 : 0;

    const rig1 = createScaleRig(scale1Offset, scale1.title || 'Timbangan 1');
    const rig2 = hasScale2 ? createScaleRig(scale2Offset, scale2?.title || 'Timbangan 2') : null;

    // Helper to populate items onto pan
    const updatePanVisualItems = (
      itemsGroup: THREE.Group,
      xCount: number,
      yCount: number,
      constantWeight: number,
      customList?: ItemType[]
    ) => {
      // Clear previous items
      while (itemsGroup.children.length > 0) {
        itemsGroup.remove(itemsGroup.children[0]);
      }

      const allItems: ItemType[] = [];

      // Add X boxes
      for (let i = 0; i < xCount; i++) allItems.push('x');
      // Add Y boxes
      for (let i = 0; i < yCount; i++) allItems.push('y');

      // If explicit custom list given, use it, else decompose constant weight
      if (customList && customList.length > 0) {
        allItems.push(...customList.filter((t) => t !== 'x' && t !== 'y'));
      } else if (constantWeight > 0) {
        const decomposed = decomposeWeightToItems(constantWeight);
        allItems.push(...decomposed);
      }

      const count = allItems.length;
      if (count === 0) return;

      const placedObjects: THREE.Object3D[] = [];
      allItems.forEach((type) => {
        const mesh = buildItemMesh(type, texMap, isSoftwareGl);
        placedObjects.push(mesh);
      });

      // Layout objects attractively in the bowl
      if (count === 1) {
        placedObjects[0].position.set(0, 0.25, 0);
        itemsGroup.add(placedObjects[0]);
      } else if (count <= 4) {
        const radius = 0.38;
        placedObjects.forEach((obj, idx) => {
          const angle = (idx / count) * Math.PI * 2;
          obj.position.set(Math.cos(angle) * radius, 0.25, Math.sin(angle) * radius);
          obj.rotation.y = angle;
          itemsGroup.add(obj);
        });
      } else {
        // Multi-ring arrangement for many items
        const innerCount = Math.min(3, count);
        const outerCount = count - innerCount;

        for (let i = 0; i < innerCount; i++) {
          const angle = (i / innerCount) * Math.PI * 2;
          placedObjects[i].position.set(Math.cos(angle) * 0.22, 0.25, Math.sin(angle) * 0.22);
          itemsGroup.add(placedObjects[i]);
        }
        for (let i = 0; i < outerCount; i++) {
          const angle = (i / outerCount) * Math.PI * 2;
          placedObjects[innerCount + i].position.set(
            Math.cos(angle) * 0.54,
            0.25,
            Math.sin(angle) * 0.54
          );
          itemsGroup.add(placedObjects[innerCount + i]);
        }
      }
    };

    // Calculate scale angle based on actual weights
    const computeScaleAngle = (scale: ScaleState, valX: number, valY: number) => {
      const leftWeight =
        scale.leftPan.xCount * valX +
        scale.leftPan.yCount * valY +
        scale.leftPan.constantWeight;
      const rightWeight =
        scale.rightPan.xCount * valX +
        scale.rightPan.yCount * valY +
        scale.rightPan.constantWeight;

      const diff = rightWeight - leftWeight;
      // Max tilt ~20 deg (0.35 rad)
      const maxTilt = 0.34;
      const angle = Math.max(-maxTilt, Math.min(maxTilt, diff * 0.05));
      const balanced = Math.abs(diff) < 0.001;
      return { angle, diff, balanced, leftWeight, rightWeight };
    };

    let lastLeft1 = -1;
    let lastRight1 = -1;
    let lastLeft2 = -1;
    let lastRight2 = -1;

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const {
        scale1: curS1,
        scale2: curS2,
        secretX: curX,
        secretY: curY,
        activeScaleFocus: curFocus,
      } = stateRef.current;

      // Update Scale 1 items if state changed
      const s1KeyL =
        curS1.leftPan.xCount * 1000 + curS1.leftPan.yCount * 100 + curS1.leftPan.constantWeight;
      const s1KeyR =
        curS1.rightPan.xCount * 1000 + curS1.rightPan.yCount * 100 + curS1.rightPan.constantWeight;

      if (s1KeyL !== lastLeft1 || s1KeyR !== lastRight1) {
        lastLeft1 = s1KeyL;
        lastRight1 = s1KeyR;
        updatePanVisualItems(
          rig1.leftItemsGroup,
          curS1.leftPan.xCount,
          curS1.leftPan.yCount,
          curS1.leftPan.constantWeight,
          curS1.leftPan.itemsList
        );
        updatePanVisualItems(
          rig1.rightItemsGroup,
          curS1.rightPan.xCount,
          curS1.rightPan.yCount,
          curS1.rightPan.constantWeight,
          curS1.rightPan.itemsList
        );
      }

      // Update Scale 2 items if present
      if (rig2 && curS2) {
        const s2KeyL =
          curS2.leftPan.xCount * 1000 + curS2.leftPan.yCount * 100 + curS2.leftPan.constantWeight;
        const s2KeyR =
          curS2.rightPan.xCount * 1000 + curS2.rightPan.yCount * 100 + curS2.rightPan.constantWeight;

        if (s2KeyL !== lastLeft2 || s2KeyR !== lastRight2) {
          lastLeft2 = s2KeyL;
          lastRight2 = s2KeyR;
          updatePanVisualItems(
            rig2.leftItemsGroup,
            curS2.leftPan.xCount,
            curS2.leftPan.yCount,
            curS2.leftPan.constantWeight,
            curS2.leftPan.itemsList
          );
          updatePanVisualItems(
            rig2.rightItemsGroup,
            curS2.rightPan.xCount,
            curS2.rightPan.yCount,
            curS2.rightPan.constantWeight,
            curS2.rightPan.itemsList
          );
        }
      }

      // Compute angles & equilibrium feedback for scale 1
      const s1Res = computeScaleAngle(curS1, curX, curY);
      rig1.targetAngle = s1Res.angle;
      rig1.currentAngle = THREE.MathUtils.damp(rig1.currentAngle, rig1.targetAngle, 4.2, delta);
      rig1.beamPivot.rotation.z = rig1.currentAngle;
      // Counter-rotate pans so they stay perfectly upright
      rig1.leftPanPivot.rotation.z = -rig1.currentAngle;
      rig1.rightPanPivot.rotation.z = -rig1.currentAngle;

      // Update indicator LED, dial text, and tags
      if (s1Res.balanced) {
        rig1.beaconMat.color.setHex(0x10b981);
        rig1.beaconLight.color.setHex(0x10b981);
        rig1.updateDialTexture('SEIMBANG MUTLAK!', true);
        rig1.dialTex.needsUpdate = true;
        rig1.leftBowlRim.color.setHex(0x10b981);
        rig1.rightBowlRim.color.setHex(0x10b981);

        if (!wasBalancedRef.current.scale1) {
          sound.playBalanceEquilibrium();
          wasBalancedRef.current.scale1 = true;
        }
      } else {
        const col = s1Res.diff > 0 ? 0xf59e0b : 0xef4444;
        rig1.beaconMat.color.setHex(col);
        rig1.beaconLight.color.setHex(col);
        const statusText = s1Res.diff > 0 ? `+${s1Res.diff} kg (MIRING KANAN)` : `${s1Res.diff} kg (MIRING KIRI)`;
        rig1.updateDialTexture(statusText, false);
        rig1.dialTex.needsUpdate = true;
        rig1.leftBowlRim.color.setHex(0x06b6d4);
        rig1.rightBowlRim.color.setHex(0xd946ef);
        wasBalancedRef.current.scale1 = false;
      }

      // Update tag labels
      rig1.leftTag.updateTag(`${s1Res.leftWeight} kg`, '#38bdf8');
      rig1.leftTag.tex.needsUpdate = true;
      rig1.rightTag.updateTag(`${s1Res.rightWeight} kg`, '#f472b6');
      rig1.rightTag.tex.needsUpdate = true;

      // Scale 2 updates if present
      if (rig2 && curS2) {
        const s2Res = computeScaleAngle(curS2, curX, curY);
        rig2.targetAngle = s2Res.angle;
        rig2.currentAngle = THREE.MathUtils.damp(rig2.currentAngle, rig2.targetAngle, 4.2, delta);
        rig2.beamPivot.rotation.z = rig2.currentAngle;
        rig2.leftPanPivot.rotation.z = -rig2.currentAngle;
        rig2.rightPanPivot.rotation.z = -rig2.currentAngle;

        if (s2Res.balanced) {
          rig2.beaconMat.color.setHex(0x10b981);
          rig2.beaconLight.color.setHex(0x10b981);
          rig2.updateDialTexture('SEIMBANG MUTLAK!', true);
          rig2.dialTex.needsUpdate = true;
          if (!wasBalancedRef.current.scale2) {
            sound.playBalanceEquilibrium();
            wasBalancedRef.current.scale2 = true;
          }
        } else {
          const col = s2Res.diff > 0 ? 0xf59e0b : 0xef4444;
          rig2.beaconMat.color.setHex(col);
          rig2.beaconLight.color.setHex(col);
          const statusText = s2Res.diff > 0 ? `+${s2Res.diff} kg (KANAN)` : `${s2Res.diff} kg (KIRI)`;
          rig2.updateDialTexture(statusText, false);
          rig2.dialTex.needsUpdate = true;
          wasBalancedRef.current.scale2 = false;
        }

        rig2.leftTag.updateTag(`${s2Res.leftWeight} kg`, '#38bdf8');
        rig2.leftTag.tex.needsUpdate = true;
        rig2.rightTag.updateTag(`${s2Res.rightWeight} kg`, '#f472b6');
        rig2.rightTag.tex.needsUpdate = true;
      }

      // Animate Companion Bot (Floating bobbing motion)
      botGroup.position.y = 2.6 + Math.sin(elapsedTime * 2.2) * 0.14;
      botGroup.rotation.y = Math.sin(elapsedTime * 1.2) * 0.15;
      propRing.rotation.z = elapsedTime * 4.0;
      antOrbMat.color.setHex(s1Res.balanced ? 0x10b981 : 0x38bdf8);

      // Animate Floating Background Math Symbols
      floatingSymbols.forEach((sym, idx) => {
        sym.rotation.y = elapsedTime * 0.3 + idx;
        sym.position.y += Math.sin(elapsedTime * 1.5 + idx) * 0.002;
      });

      // Animate Celebratory Particles when balanced
      if (s1Res.balanced) {
        particleMat.opacity = THREE.MathUtils.damp(particleMat.opacity, 0.85, 3.0, delta);
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleVelocities[i].y;
          positions[i * 3] += particleVelocities[i].x;
          positions[i * 3 + 2] += particleVelocities[i].z;

          if (positions[i * 3 + 1] > 5.5) {
            positions[i * 3 + 1] = 0.5;
            positions[i * 3] = (Math.random() - 0.5) * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      } else {
        particleMat.opacity = THREE.MathUtils.damp(particleMat.opacity, 0, 4.0, delta);
      }

      // Dynamic Camera Position based on active focus
      let targetCamX = 0;
      let targetCamY = 4.4;
      let targetCamZ = 11.5;

      if (rig2) {
        if (curFocus === 'scale1') {
          targetCamX = -3.5;
          targetCamZ = 9.2;
        } else if (curFocus === 'scale2') {
          targetCamX = 3.5;
          targetCamZ = 9.2;
        } else {
          targetCamX = 0;
          targetCamZ = 13.0;
        }
      } else {
        targetCamX = 0;
        targetCamZ = 11.0;
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 3.5, delta);
      camera.lookAt(camera.position.x * 0.35, 1.8, 0);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 8);
          } else {
            gl.deleteSync(sync);
            frameId = window.setTimeout(tick, 70);
          }
        };
        frameId = window.setTimeout(poll, 8);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      pmremGenerator.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [levelId]);

  // Handle Drag-and-Drop events from HTML5 inventory items onto 3D pans
  const handleDragOver = (e: React.DragEvent, pan: 'left' | 'right') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (pan === 'left') setIsDragOverLeft(true);
    if (pan === 'right') setIsDragOverRight(true);
  };

  const handleDragLeave = (pan: 'left' | 'right') => {
    if (pan === 'left') setIsDragOverLeft(false);
    if (pan === 'right') setIsDragOverRight(false);
  };

  const handleDrop = (e: React.DragEvent, pan: 'left' | 'right') => {
    e.preventDefault();
    setIsDragOverLeft(false);
    setIsDragOverRight(false);
    try {
      const itemType = e.dataTransfer.getData('application/balance-item') as ItemType;
      if (itemType && onDropItem) {
        sound.playDropItem();
        onDropItem(pan, itemType);
      }
    } catch {}
  };

  return (
    <div className="relative w-full h-full min-h-[460px] md:min-h-[500px] select-none overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-950 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Interactive Drag & Drop Overlays over Left and Right Pans */}
      <div className="absolute inset-0 pointer-events-none flex">
        {/* Left Pan Drop Target */}
        <div
          onDragOver={(e) => handleDragOver(e, 'left')}
          onDragLeave={() => handleDragLeave('left')}
          onDrop={(e) => handleDrop(e, 'left')}
          className={`flex-1 h-full pointer-events-auto transition-all duration-300 flex flex-col justify-end p-6 ${
            isDragOverLeft
              ? 'bg-cyan-500/20 border-2 border-dashed border-cyan-400 shadow-[inset_0_0_40px_rgba(6,182,212,0.3)]'
              : 'hover:bg-cyan-500/5'
          }`}
        >
          {isDragOverLeft && (
            <div className="self-center mb-16 px-4 py-2 rounded-2xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-sm font-bold animate-bounce shadow-xl flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Lepaskan di Mangkuk Kiri!
            </div>
          )}
        </div>

        {/* Right Pan Drop Target */}
        <div
          onDragOver={(e) => handleDragOver(e, 'right')}
          onDragLeave={() => handleDragLeave('right')}
          onDrop={(e) => handleDrop(e, 'right')}
          className={`flex-1 h-full pointer-events-auto transition-all duration-300 flex flex-col justify-end p-6 ${
            isDragOverRight
              ? 'bg-fuchsia-500/20 border-2 border-dashed border-fuchsia-400 shadow-[inset_0_0_40px_rgba(217,70,239,0.3)]'
              : 'hover:bg-fuchsia-500/5'
          }`}
        >
          {isDragOverRight && (
            <div className="self-center mb-16 px-4 py-2 rounded-2xl bg-fuchsia-950/90 border border-fuchsia-400 text-fuchsia-200 text-sm font-bold animate-bounce shadow-xl flex items-center gap-2">
              <Zap className="w-4 h-4 text-fuchsia-400" />
              Lepaskan di Mangkuk Kanan!
            </div>
          )}
        </div>
      </div>

      {/* Top HUD: Dual Scale Focus Selector if scale2 is active */}
      {scale2 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-cyan-500/40 rounded-2xl shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => onScaleFocusChange?.('all')}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
              activeScaleFocus === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Timbangan
          </button>
          <button
            type="button"
            onClick={() => {
              onScaleFocusChange?.('scale1');
              setActiveScaleTab('scale1');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
              activeScaleFocus === 'scale1'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            Timbangan 1 (Kiri)
          </button>
          <button
            type="button"
            onClick={() => {
              onScaleFocusChange?.('scale2');
              setActiveScaleTab('scale2');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
              activeScaleFocus === 'scale2'
                ? 'bg-fuchsia-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-fuchsia-300'
            }`}
          >
            Timbangan 2 (Kanan)
          </button>
        </div>
      )}

      {/* Floating Dynamic Digital Sensor Panel (Top Left) */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <div className="bg-slate-950/85 border border-cyan-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
            <Scale className="w-3.5 h-3.5" />
            Sensor Beban Digital
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isScaleBalanced
                  ? 'bg-emerald-400 shadow-[0_0_12px_#10b981]'
                  : 'bg-rose-500 shadow-[0_0_12px_#ef4444]'
              }`}
            />
            <span className="text-xs md:text-sm font-mono font-extrabold text-white">
              {isScaleBalanced
                ? 'SEIMBANG MUTLAK (Δm = 0.00 kg)'
                : massDiff > 0
                ? `Miring Kanan (+${massDiff.toFixed(1)} kg)`
                : `Miring Kiri (${massDiff.toFixed(1)} kg)`}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Kiri: {leftMass} kg &middot; Kanan: {rightMass} kg
          </div>
        </div>
      </div>

      {/* Floating Interactive Companion Robot Dialog (Top Right) */}
      <div className="absolute top-3 right-3 z-20 pointer-events-none max-w-[240px] md:max-w-[280px]">
        <div className="bg-slate-950/90 border border-indigo-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-start gap-2.5">
          <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Asisten Robot Equi-Bot
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {isScaleBalanced
                ? 'Luar biasa! Kedua lengan timbangan sejajar sempurna! Kamu bisa mengecek jawabanmu.'
                : massDiff > 0
                ? 'Sisi kanan lebih berat! Kurangi beban kanan atau tambah beban di mangkuk kiri!'
                : 'Sisi kiri lebih berat! Tarik objek atau sesuaikan beban untuk menyeimbangkannya!'}
            </p>
          </div>
        </div>
      </div>

      {/* Prominent PERFECT BALANCE! Celebratory Banner */}
      {showEquilibriumBanner && (
        <div className="absolute inset-x-0 top-1/4 z-30 flex items-center justify-center pointer-events-none">
          <div className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-slate-950 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.8)] border-2 border-white flex items-center gap-3 animate-bounce">
            <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            <div className="text-center">
              <div className="text-xl md:text-2xl font-black tracking-wider uppercase font-mono">
                PERFECT BALANCE!
              </div>
              <div className="text-xs font-bold text-emerald-950">
                Titik Keseimbangan Tercapai &middot; +50 Poin Bonus!
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
        </div>
      )}

      {/* Bottom Hint for Drag & Drop */}
      <div className="absolute bottom-2 inset-x-0 z-10 flex justify-center pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] text-slate-300 backdrop-blur-sm shadow flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Seret objek dari Inventory di bawah langsung ke Mangkuk Kiri atau Kanan!</span>
        </div>
      </div>
    </div>
  );
};
