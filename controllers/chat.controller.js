import { response, request } from 'express';
import { Configuration, OpenAIApi } from 'openai';
import { getWordData, getExcelData, getPDFData } from '../db/db.js';

// Función para formatear datos de Excel a HTML
const formatExcelData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '<p>No hay datos de Excel disponibles.</p>';
  }

  const headers = [
    'CUENTA', 'GRUPO_FACT', 'CICLO', 'RAZON_SOCIAL', 'RUC', 'SERVICIO', 
    'LARGE', 'DOCUMENTO', 'EMISION', 'VENCIMIENTO', 'MON', 'TIPO_CAMBIO', 
    'MONTO', 'RECLAMO', 'SALDO', 'ESTADO_DOCUMENTO', 'ESTADO_DOCUMENTO_COB', 
    'SALDO_SOLES', 'DEUDA_SOLES', 'SALDO_FAVOR', 'EJECUTIVO', 'SUPERVISOR', 
    'SECTOR', 'REGION', 'WHITELIST', 'GESTOR', 'GESTOR_TIPO', 'ASIGNADO'
  ];

  let html = '<table border="1" style="border-collapse: collapse; width: 100%;">';
  html += '<thead><tr>' + headers.map(header => `<th>${header}</th>`).join('') + '</tr></thead>';
  html += '<tbody>';

  data.forEach((row, index) => {
    if (index > 0) { // Ignorar encabezados
      html += '<tr>' + row.map(cell => `<td>${cell !== undefined && cell !== null ? cell : ''}</td>`).join('') + '</tr>';
    }
  });

  html += '</tbody></table>';
  return html;
};

const MAX_PROMPT_LENGTH = 2000;

export const callChatGpt = async (req = request, res = response) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(401).json({ error: 'La clave de la API de OpenAI está ausente. Asegúrate de establecerla en tus variables de entorno.' });
    }

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'El campo "prompt" es obligatorio.' });
    }

    let fullPrompt = prompt;

    if (prompt.toLowerCase().includes('en claro')) {
      const wordData = await getWordData('Generación de proyecto y SOT - CAMBIO DE PLAN.docx');
      const excelData = await getExcelData('Deuda_Carterizada.xlsx');
      const pdfData = await getPDFData('GUIA-DE-LLENADO-B02.pdf');

      console.log('Datos de Word:', wordData);
      console.log('Datos de Excel:', excelData);
      console.log('Datos de PDF:', pdfData);

      if (!wordData || !excelData || !pdfData) {
        throw new Error('No se pudieron obtener todos los datos necesarios.');
      }

      const formattedExcelData = formatExcelData(excelData);
      const formattedPDFData = pdfData.map(page => page.join(' ')).join('\n');
      
      fullPrompt = `${prompt}\n\nDatos de Word:\n${wordData}\n\nDatos de Excel:\n${formattedExcelData}\n\nDatos de PDF:\n${formattedPDFData}`;
    }

    console.log('Longitud del prompt:', fullPrompt.length);
    if (fullPrompt.length > MAX_PROMPT_LENGTH) {
      fullPrompt = fullPrompt.slice(0, MAX_PROMPT_LENGTH);
      console.warn('El prompt ha sido truncado debido a su longitud.');
    }

    const queryObj = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: fullPrompt }],
      max_tokens: 150,
      temperature: 0.7,
    };

    const completion = await openai.createChatCompletion(queryObj);

    if (!completion || !completion.data || !completion.data.choices || completion.data.choices.length === 0) {
      console.error('Detalles de la respuesta de OpenAI:', completion);
      throw new Error('La respuesta de la API de OpenAI es inválida.');
    }

    const message = completion.data.choices[0].message;

    res.json({ message });
  } catch (error) {
    console.error('Error en la llamada al modelo de chat GPT:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const callImageGpt = async (req = request, res = response) => {
  try {
    const { prompt, nImage, size } = req.body;

    const queryObj = {
      prompt,
      nImage,
      size,
    };

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);

    const imageResponse = await openai.createImage(queryObj);
    
    if (!imageResponse || !imageResponse.data || !imageResponse.data.data || imageResponse.data.data.length === 0) {
      throw new Error('La respuesta de la API de OpenAI para la imagen es inválida.');
    }

    const images = imageResponse.data.data.map(img => img.url);

    res.json({ images });
  } catch (error) {
    console.error('Error en la generación de imagen GPT:', error.message);
    res.status(500).json({ error: error.message });
  }
};


















