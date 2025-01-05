import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import DataModel from '../models/model.js';

const databasePath = path.join(process.cwd(), 'uploads');

// Conexión a la base de datos MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conexión a MongoDB exitosa 🔥');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

// Función para obtener datos de archivos Word
const getWordData = async (filename) => {
  const filePath = path.join(databasePath, filename);
  try {
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value.trim();
  } catch (error) {
    console.error('Error al leer el archivo Word:', error.message);
    return null;
  }
};

// Función para obtener datos de archivos Excel
const getExcelData = (filename) => {
  const filePath = path.join(databasePath, filename);
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    if (sheetNames.length === 0) {
      console.error('El archivo Excel no contiene hojas.');
      return null;
    }

    const worksheet = workbook.Sheets[sheetNames[0]]; // Acceder a la primera hoja
    let excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Limpieza de datos: eliminar celdas y filas vacías
    excelData = excelData
      .map(row => row.filter(cell => cell !== null && cell !== undefined && cell !== ''))
      .filter(row => row.length > 0);

    console.log('Datos leídos del archivo Excel:', excelData);
    return excelData;
  } catch (error) {
    console.error('Error al leer el archivo Excel:', error.message);
    return null;
  }
};

// Función para obtener datos de archivos PDF
const getPDFData = async (filename) => {
  const filePath = path.join(databasePath, filename);
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjs.getDocument({ data }).promise;
    const totalPages = pdf.numPages;
    const extractedData = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const pageTextContent = await page.getTextContent();
      const pageData = pageTextContent.items.map(item => item.str);
      extractedData.push(pageData);
    }

    return extractedData;
  } catch (error) {
    console.error('Error al leer el archivo PDF:', error.message);
    return null;
  }
};

// Guardar los datos en MongoDB
const saveDataToMongoDB = async (wordData, excelData, pdfData) => {
  try {
    if (wordData || (excelData && excelData.length > 0) || pdfData) {
      const data = new DataModel({
        wordData: wordData,
        excelData: excelData && excelData.length > 0 ? excelData : undefined, // Guardar solo si hay datos
        pdfData: pdfData && pdfData.length > 0 ? pdfData : undefined,
      });

      await data.save();
      console.log('Datos guardados en MongoDB correctamente');
    } else {
      console.warn('No hay datos válidos para guardar en MongoDB');
    }
  } catch (error) {
    console.error('Error al guardar los datos en MongoDB:', error.message);
  }
};

export { connectDB, getWordData, getExcelData, getPDFData, saveDataToMongoDB };











