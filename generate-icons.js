// 生成 PNG 图标脚本
// 运行: node generate-icons.js

const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// 简单的 PNG 生成器（使用 BMP 格式）
function createIcon(size) {
  const canvas = Buffer.alloc(size * size * 4 + 54);
  let offset = 54;

  // BMP 文件头
  canvas.write('BM', 0);
  canvas.writeUInt32LE(canvas.length, 2);
  canvas.writeUInt32LE(0, 6);
  canvas.writeUInt32LE(54, 10);

  // DIB 头
  canvas.writeUInt32LE(40, 14);
  canvas.writeInt32LE(size, 18);
  canvas.writeInt32LE(-size, 22); // 负数表示从上到下
  canvas.writeUInt16LE(1, 26);
  canvas.writeUInt16LE(32, 28);
  canvas.writeUInt32LE(0, 30);
  canvas.writeUInt32LE(size * size * 4, 34);
  canvas.writeInt32LE(2835, 38);
  canvas.writeInt32LE(2835, 42);
  canvas.writeUInt32LE(0, 46);
  canvas.writeUInt32LE(0, 50);

  // 颜色数据
  const center = size / 2;
  const radius = size / 2 - 1;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // 背景渐变
        const t = dist / radius;
        let r, g, b;

        // 外圈红黑渐变
        const bgT = Math.max(0, (0.8 - t) / 0.8);
        r = Math.round(26 + bgT * (45 - 26));
        g = Math.round(26 + bgT * (45 - 26));
        b = Math.round(26 + bgT * (45 - 26));

        // 边框
        if (dist > radius - 2) {
          r = 229; g = 57; b = 53; // 红色边框
        }

        // 火焰中心
        if (x >= size * 0.35 && x <= size * 0.65 && y >= size * 0.25 && y <= size * 0.75) {
          // 内层火焰 - 金黄色
          const fireT = (y - size * 0.25) / (size * 0.5);
          const mirrorX = size - x - 1;
          const inFlame = x >= size * 0.42 && x <= size * 0.58 &&
                          y >= size * 0.3 && y <= size * 0.7;
          const inInnerFlame = x >= size * 0.45 && x <= size * 0.55 &&
                               y >= size * 0.4 && y <= size * 0.65;

          if (inInnerFlame) {
            // 白色高光
            r = 255; g = 255; b = 255;
          } else if (inFlame) {
            // 金黄色火焰
            r = 255; g = 202; b = 40;
          } else if (x > size * 0.35 && x < size * 0.4 && y > size * 0.3 + (x - size * 0.35) * 2) {
            // 火焰左侧
            r = 255; g = 111; b = 0;
          } else if (x > size * 0.6 && x < size * 0.65 && y > size * 0.3 + (size * 0.65 - x) * 2) {
            // 火焰右侧
            r = 255; g = 111; b = 0;
          } else if (y > size * 0.4 && y < size * 0.75) {
            // 火焰底部
            r = 229; g = 57; b = 53;
          }
        }

        canvas.writeUInt8(b, offset++);
        canvas.writeUInt8(g, offset++);
        canvas.writeUInt8(r, offset++);
        canvas.writeUInt8(255, offset++); // Alpha
      } else {
        offset += 4;
      }
    }
  }

  return canvas;
}

console.log('正在生成图标...\n');

// 确保 icons 目录存在
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 生成图标
sizes.forEach(size => {
  const iconData = createIcon(size);
  const filename = `icon${size}.png`;
  const filepath = path.join(iconsDir, filename);
  fs.writeFileSync(filepath, iconData);
  console.log(`✓ 已生成 ${filename} (${size}x${size})`);
});

console.log('\n图标生成完成！');
