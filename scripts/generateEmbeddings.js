/*import tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import mammoth from 'mammoth';
import XLSX from 'xlsx';
import PDFParser from 'pdf2json';

import { connectDB, Embedding } from '../db/db.js'; // Importar la función connectDB desde tu archivo database.js

const embeddingModel = tf.sequential();
const inputSize = 100; // Tamaño de entrada de los datos
const embeddingSize = 256; // Tamaño del embedding resultante

embeddingModel.add(tf.layers.dense({ units: 256, inputShape: [inputSize] }));
embeddingModel.add(tf.layers.dense({ units: embeddingSize }));

// Función para generar el embedding de un archivo
async function generateEmbedding(filepath) {
  try {
    let fileContent;

    // Leer el contenido del archivo según el tipo
    if (isWordFile(filepath)) {
      fileContent = await extractTextFromWord(filepath);
    } else if (isExcelFile(filepath)) {
      fileContent = await extractTextFromExcel(filepath);
    } else if (isPDFFile(filepath)) {
      fileContent = await extractTextFromPDF(filepath);
    } else {
      console.error('Tipo de archivo no compatible:', filepath);
      return null;
    }

    // Generar el embedding del contenido
    const embedding = embeddingModel.predict(tf.tensor2d([fileContent], [1, inputSize]));

    return Array.from(embedding.dataSync());
  } catch (error) {
    console.error('Error al generar el embedding:', error);
    return null;
  }
}

// Función para extraer texto de un archivo de Word
async function extractTextFromWord(filepath) {
  try {
    const fileData = fs.readFileSync(filepath);
    const result = await mammoth.extractRawText({ buffer: fileData });
    return result.value.trim();
  } catch (error) {
    console.error('Error al extraer texto de archivo de Word:', error);
    return null;
  }
}

// Función para extraer texto de un archivo de Excel
async function extractTextFromExcel(filepath) {
  try {
    const workbook = XLSX.readFile(filepath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_csv(worksheet);
  } catch (error) {
    console.error('Error al extraer texto de archivo de Excel:', error);
    return null;
  }
}

// Función para extraer texto de un archivo PDF
async function extractTextFromPDF(filepath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataReady', function (data) {
      const pages = data && data.formImage && data.formImage.Pages;
      if (pages) {
        const textContent = pages
          .map((page) => page.Texts.map((text) => text.R.map((r) => r.T).join('')).join(' '))
          .join('\n');
        resolve(textContent);
      } else {
        reject(new Error('No se encontraron páginas en el archivo PDF'));
      }
    });
    pdfParser.on('pdfParser_dataError', function (error) {
      reject(error);
    });

    const pdfData = fs.readFileSync(filepath);
    pdfParser.parseBuffer(pdfData);
  });
}

// Funciones auxiliares para verificar el tipo de archivo
function isWordFile(filepath) {
  const extension = path.extname(filepath).toLowerCase();
  return ['.doc', '.docx'].includes(extension);
}

function isExcelFile(filepath) {
  const extension = path.extname(filepath).toLowerCase();
  return ['.xls', '.xlsx'].includes(extension);
}

function isPDFFile(filepath) {
  const extension = path.extname(filepath).toLowerCase();
  return ['.pdf'].includes(extension);
}

// Función para guardar el embedding en la base de datos
async function saveEmbedding(filepath, embedding) {
  try {
    // Establecer la conexión a la base de datos
    await connectDB(); // Llamar a la función connectDB para establecer la conexión

    // Crear un modelo y guardar el embedding en la base de datos
    const Embedding = mongoose.model('Embedding', { filepath: String, embedding: [Number] });
    await Embedding.create({ filepath, embedding });

    console.log(`Embedding de ${filepath} guardado en la base de datos`);
  } catch (error) {
    console.error('Error al guardar el embedding en la base de datos:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Ruta del directorio que contiene los archivos
const directoryPath = 'uploads';

// Obtener la lista de archivos en el directorio
fs.readdir(directoryPath, async (err, files) => {
  if (err) {
    console.error('Error al leer el directorio:', err);
    return;
  }

  // Generar y guardar el embedding para cada archivo
  for (const file of files) {
    const filepath = path.join(directoryPath, file);
    const embedding = await generateEmbedding(filepath);
    if (embedding) {
      await saveEmbedding(filepath, embedding);
    }
  }
});

export { generateEmbedding, saveEmbedding };*/
