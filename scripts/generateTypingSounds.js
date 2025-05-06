const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Ensure the sounds directory exists
const soundsDir = path.join(__dirname, '../public/sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Base sound file path (you'll need to provide this)
const baseSoundPath = path.join(__dirname, '../assets/base-type.mp3');

// Generate variants with different pitch and speed
const variants = [
  { pitch: 1.0, speed: 1.0 },  // Original
  { pitch: 1.1, speed: 1.0 },  // Higher pitch
  { pitch: 0.9, speed: 1.0 },  // Lower pitch
  { pitch: 1.0, speed: 1.1 },  // Faster
];

// Generate each variant using ffmpeg
variants.forEach((variant, index) => {
  const outputPath = path.join(soundsDir, `type${index + 1}.mp3`);
  
  // FFmpeg command to modify pitch and speed
  const command = `ffmpeg -i "${baseSoundPath}" -filter:a "asetrate=44100*${variant.pitch},aresample=44100,atempo=${variant.speed}" -y "${outputPath}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating variant ${index + 1}:`, error);
      return;
    }
    console.log(`Generated type${index + 1}.mp3`);
  });
}); 