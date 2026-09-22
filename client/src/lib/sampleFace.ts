import { fromManualAnchors } from './faceLandmarks';
import type { FaceData } from '../types';

/** Gerald: a hand-drawn volunteer who has agreed to be defaced for science. */
export function makeGerald(): { canvas: HTMLCanvasElement; face: FaceData } {
  const c = document.createElement('canvas');
  c.width = 900;
  c.height = 1100;
  const g = c.getContext('2d')!;
  g.fillStyle = '#efe6cf';
  g.fillRect(0, 0, c.width, c.height);
  // Newspaper halftone.
  g.fillStyle = 'rgba(26,26,46,0.07)';
  for (let y = 0; y < c.height; y += 14) for (let x = (y / 14) % 2 ? 7 : 0; x < c.width; x += 14) g.fillRect(x, y, 3, 3);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = '#1a1a2e';
  g.lineWidth = 7;
  // Shirt + neck
  g.fillStyle = '#7aa6c2';
  g.beginPath();
  g.moveTo(130, 1100);
  g.quadraticCurveTo(160, 900, 450, 880);
  g.quadraticCurveTo(740, 900, 770, 1100);
  g.fill();
  g.stroke();
  g.fillStyle = '#f2c9a0';
  g.fillRect(385, 760, 130, 140);
  g.strokeRect(385, 760, 130, 140);
  // Ears
  for (const x of [247, 653]) {
    g.beginPath();
    g.ellipse(x, 520, 38, 62, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }
  // Head
  g.beginPath();
  g.ellipse(450, 502, 205, 302, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // Three brave hairs
  g.lineWidth = 5;
  for (const [x, dx] of [[420, -30], [450, 0], [480, 35]]) {
    g.beginPath();
    g.moveTo(x, 203);
    g.quadraticCurveTo(x + dx, 150, x + dx * 1.6 + 10, 130);
    g.stroke();
  }
  // Eyes
  g.fillStyle = '#fff';
  g.lineWidth = 5;
  for (const x of [360, 540]) {
    g.beginPath();
    g.ellipse(x, 470, 42, 26, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = '#3d2b1f';
    g.beginPath();
    g.arc(x, 472, 15, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
  }
  // Brows, mildly concerned
  g.lineWidth = 9;
  g.beginPath();
  g.moveTo(315, 418); g.quadraticCurveTo(360, 400, 400, 414);
  g.moveTo(500, 414); g.quadraticCurveTo(540, 400, 585, 418);
  g.stroke();
  // Nose + mouth
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(450, 505); g.quadraticCurveTo(425, 590, 450, 600); g.quadraticCurveTo(470, 602, 478, 590);
  g.stroke();
  g.beginPath();
  g.moveTo(385, 685); g.quadraticCurveTo(450, 725, 515, 685);
  g.stroke();
  // Name tag
  g.save();
  g.translate(620, 980);
  g.rotate(-0.08);
  g.fillStyle = '#e63946';
  g.fillRect(-110, -60, 220, 120);
  g.fillStyle = '#fff';
  g.fillRect(-100, -18, 200, 68);
  g.font = 'bold 20px system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText('HELLO my name is', 0, -28);
  g.fillStyle = '#1a1a2e';
  g.font = '44px "Permanent Marker", cursive';
  g.fillText('Gerald', 0, 32);
  g.restore();

  const face = fromManualAnchors({
    leftEye: { x: 360, y: 472 },
    rightEye: { x: 540, y: 472 },
    mouth: { x: 450, y: 695 },
    forehead: { x: 450, y: 212 },
  });
  return { canvas: c, face };
}
