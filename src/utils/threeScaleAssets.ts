/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ItemType } from '../types/game';

// Helper to create high-resolution crisp canvas textures for 3D objects
export function createBoxXTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // High-tech cyber gradient background
  const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 320);
  grad.addColorStop(0, '#0284c7');
  grad.addColorStop(0.6, '#0369a1');
  grad.addColorStop(1, '#082f49');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Outer neon frame
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 16;
  ctx.strokeRect(16, 16, 480, 480);

  // Inner beveled techno frame
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, 432, 432);

  // Corner techno rivets
  const corners = [
    [54, 54],
    [458, 54],
    [54, 458],
    [458, 458],
  ];
  ctx.fillStyle = '#67e8f9';
  corners.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // Glowing central disc
  const discGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 160);
  discGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
  discGrad.addColorStop(1, 'rgba(6, 182, 212, 0.05)');
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.arc(256, 256, 160, 0, Math.PI * 2);
  ctx.fill();

  // Bold stylized 'X'
  ctx.save();
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 35;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 240px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('X', 256, 246);
  ctx.restore();

  // Bottom subtitle
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VARIABEL X', 256, 420);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

export function createBoxYTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // High-tech magenta/purple cyber gradient
  const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 320);
  grad.addColorStop(0, '#c026d3');
  grad.addColorStop(0.6, '#9333ea');
  grad.addColorStop(1, '#3b0764');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Outer neon frame
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 16;
  ctx.strokeRect(16, 16, 480, 480);

  // Inner frame
  ctx.strokeStyle = '#e879f9';
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, 432, 432);

  // Corner rivets
  const corners = [
    [54, 54],
    [458, 54],
    [54, 458],
    [458, 458],
  ];
  ctx.fillStyle = '#fbcfe8';
  corners.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // Glowing disc
  const discGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 160);
  discGrad.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
  discGrad.addColorStop(1, 'rgba(168, 85, 247, 0.05)');
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.arc(256, 256, 160, 0, Math.PI * 2);
  ctx.fill();

  // Bold stylized 'Y'
  ctx.save();
  ctx.shadowColor = '#ff2df7';
  ctx.shadowBlur = 35;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 240px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Y', 256, 246);
  ctx.restore();

  // Subtitle
  ctx.fillStyle = '#f472b6';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VARIABEL Y', 256, 420);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

export function createGoldBarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Brushed gold gradient
  const grad = ctx.createLinearGradient(0, 0, 256, 128);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.3, '#eab308');
  grad.addColorStop(0.7, '#ca8a04');
  grad.addColorStop(1, '#a16207');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 244, 116);

  // Mint stamp
  ctx.fillStyle = '#422006';
  ctx.font = '900 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('2 kg', 128, 54);

  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('FINE GOLD 999.9', 128, 96);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createStarShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const points = 5;
  const outerRadius = 0.38;
  const innerRadius = 0.18;
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

export function createWeightBadgeTexture(text: string, bgColor: string, textColor = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 120, 120);

  ctx.fillStyle = textColor;
  ctx.font = '900 40px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Procedural 3D Mesh Generator for each item type
export function buildItemMesh(
  type: ItemType,
  texMap: Record<string, THREE.CanvasTexture>,
  isSoftwareGl: boolean
): THREE.Object3D {
  const group = new THREE.Group();

  switch (type) {
    case 'x': {
      // Kotak X: Electric cyan cube with bevel and neon glow
      const geo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
      const mat = new THREE.MeshStandardMaterial({
        map: texMap.boxX,
        metalness: 0.35,
        roughness: 0.25,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      group.add(mesh);

      // Glowing corner wireframe bracket
      const wireGeo = new THREE.BoxGeometry(0.57, 0.57, 0.57);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      group.add(wire);
      break;
    }

    case 'y': {
      // Kotak Y: Neon magenta/purple cube
      const geo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
      const mat = new THREE.MeshStandardMaterial({
        map: texMap.boxY,
        metalness: 0.35,
        roughness: 0.25,
        emissive: 0xa21caf,
        emissiveIntensity: 0.35,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      group.add(mesh);

      const wireGeo = new THREE.BoxGeometry(0.57, 0.57, 0.57);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xf472b6,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      group.add(wire);
      break;
    }

    case 'weight_2': {
      // Balok Emas bertuliskan 2 kg (Gold Ingot Bar)
      const geo = new THREE.BoxGeometry(0.65, 0.28, 0.36);
      const mat = new THREE.MeshStandardMaterial({
        map: texMap.goldBar,
        color: 0xfbbf24,
        metalness: 0.95,
        roughness: 0.18,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      group.add(mesh);
      break;
    }

    case 'weight_3': {
      // Bintang Kuning bertuliskan 3 kg (Yellow 3D Star)
      const starShape = createStarShape();
      const extrudeSettings = {
        depth: 0.22,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.04,
        bevelThickness: 0.04,
      };
      const geo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
      geo.center();
      const mat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.75,
        roughness: 0.2,
        emissive: 0xca8a04,
        emissiveIntensity: 0.25,
      });
      const starMesh = new THREE.Mesh(geo, mat);
      starMesh.castShadow = !isSoftwareGl;
      group.add(starMesh);

      // Center circular badge with "3 kg"
      const badgeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 24);
      const badgeMat = new THREE.MeshStandardMaterial({
        map: texMap.badge3,
        roughness: 0.3,
        metalness: 0.4,
      });
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      badge.rotation.x = Math.PI / 2;
      group.add(badge);
      break;
    }

    case 'weight_4': {
      // Kristal Hijau bertuliskan 4 kg (Emerald Faceted Crystal)
      const topGeo = new THREE.ConeGeometry(0.3, 0.45, 6);
      const bottomGeo = new THREE.ConeGeometry(0.3, 0.35, 6);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.2,
        roughness: 0.12,
        emissive: 0x059669,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.92,
      });

      const top = new THREE.Mesh(topGeo, crystalMat);
      top.position.y = 0.2;
      top.castShadow = !isSoftwareGl;
      group.add(top);

      const bottom = new THREE.Mesh(bottomGeo, crystalMat);
      bottom.rotation.x = Math.PI;
      bottom.position.y = -0.15;
      bottom.castShadow = !isSoftwareGl;
      group.add(bottom);

      // Center ring band labeled "4 kg"
      const ringGeo = new THREE.CylinderGeometry(0.31, 0.31, 0.14, 16);
      const ringMat = new THREE.MeshStandardMaterial({
        map: texMap.badge4,
        roughness: 0.3,
        metalness: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);
      break;
    }

    case 'weight_5': {
      // Bola Merah bertuliskan 5 kg (Glossy Ruby Sphere)
      const sphereGeo = new THREE.SphereGeometry(0.32, 28, 28);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        metalness: 0.3,
        roughness: 0.1,
        emissive: 0xb91c1c,
        emissiveIntensity: 0.25,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.castShadow = !isSoftwareGl;
      sphere.receiveShadow = !isSoftwareGl;
      group.add(sphere);

      // Equatorial label band with "5 kg"
      const bandGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.16, 24);
      const bandMat = new THREE.MeshStandardMaterial({
        map: texMap.badge5,
        roughness: 0.3,
        metalness: 0.6,
      });
      const band = new THREE.Mesh(bandGeo, bandMat);
      group.add(band);
      break;
    }

    case 'weight_6': {
      // Berlian Biru bertuliskan 6 kg (Blue Sapphire Brilliant Diamond)
      const crownGeo = new THREE.CylinderGeometry(0.24, 0.34, 0.2, 8);
      const pavilionGeo = new THREE.ConeGeometry(0.34, 0.45, 8);
      const diamondMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.3,
        roughness: 0.08,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.94,
      });

      const crown = new THREE.Mesh(crownGeo, diamondMat);
      crown.position.y = 0.22;
      crown.castShadow = !isSoftwareGl;
      group.add(crown);

      const pavilion = new THREE.Mesh(pavilionGeo, diamondMat);
      pavilion.rotation.x = Math.PI;
      pavilion.position.y = -0.1;
      pavilion.castShadow = !isSoftwareGl;
      group.add(pavilion);

      // Flat top table facet with "6 kg" badge
      const capGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 8);
      const capMat = new THREE.MeshStandardMaterial({
        map: texMap.badge6,
        roughness: 0.2,
        metalness: 0.5,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.32;
      group.add(cap);
      break;
    }

    case 'weight_1': {
      // Koin Perak bertuliskan 1 kg
      const coinGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.1, 24);
      const coinMat = new THREE.MeshStandardMaterial({
        map: texMap.badge1,
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.2,
      });
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.castShadow = !isSoftwareGl;
      group.add(coin);
      break;
    }

    case 'weight_10': {
      // Baterai Neon bertuliskan 10 kg
      const cylGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.65, 24);
      const cylMat = new THREE.MeshStandardMaterial({
        map: texMap.badge10,
        color: 0x8b5cf6,
        metalness: 0.7,
        roughness: 0.25,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.3,
      });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      cyl.castShadow = !isSoftwareGl;
      group.add(cyl);

      // Top glowing energy cap
      const capGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xc084fc,
        emissive: 0xc084fc,
        emissiveIntensity: 0.8,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.38;
      group.add(cap);
      break;
    }

    default:
      break;
  }

  return group;
}

// Decomposition of any constant weight into rich colorful objects
export function decomposeWeightToItems(weight: number): ItemType[] {
  const result: ItemType[] = [];
  let rem = weight;

  while (rem >= 10) {
    result.push('weight_10');
    rem -= 10;
  }
  while (rem >= 6) {
    result.push('weight_6');
    rem -= 6;
  }
  while (rem >= 5) {
    result.push('weight_5');
    rem -= 5;
  }
  while (rem >= 4) {
    result.push('weight_4');
    rem -= 4;
  }
  while (rem >= 3) {
    result.push('weight_3');
    rem -= 3;
  }
  while (rem >= 2) {
    result.push('weight_2');
    rem -= 2;
  }
  while (rem >= 1) {
    result.push('weight_1');
    rem -= 1;
  }

  return result;
}
