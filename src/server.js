import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { log } from 'console';

const app = express();
const PORT = 3000;
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

app.use(express.static('public'));

// Configuração do Multer
const storage = multer.diskStorage({
  destination: 'src/uploads/',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(dirname + '/views/form.html');
});

app.post('/src/uploads', upload.single('imagem'), async (req, res) => {
  const { name, width, quality } = req.body;
  const filePath = req.file.path;
  const maxDimension = 16383;
  const outputFileName = (name?.trim().replace(/\s+/g, '-').replace(/[^\w.-]/g, '') || Date.now()) + '.webp';
  const outputPath = path.join('public/images', outputFileName);

  try {
    // Resize + Convert to .webp
    await sharp(filePath,  {limitInputPixels: false})
      .resize(width ? { width: parseInt(width) } : maxDimension)
      .webp(quality ? { quality: parseInt(quality) } : 80)
      .toFile(outputPath);

    // Remove imagem original
    fs.unlinkSync(filePath);

    res.send(`<img src="/images/${outputFileName}" style="max-width: 400px;"/>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao processar a imagem.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
