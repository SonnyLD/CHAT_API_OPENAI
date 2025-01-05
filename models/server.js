import express from 'express';
import cors from 'cors';
import chatRoutes from '../routes/chat.route.js';
import { connectDB, getWordData, getExcelData, getPDFData, saveDataToMongoDB } from '../db/db.js';
import DataModel from '../models/model.js';  // Asegúrate de que el modelo esté correctamente importado

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8081;

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  routes() {
    this.app.use('/api', chatRoutes);

    // Ruta para manejar las consultas del chat
    this.app.post('/api/chat', async (req, res) => {
      const { message } = req.body;
      const reply = await this.handleMessage(message);
      res.send({ reply });
    });
  }

  async start() {
    try {
      await connectDB();

      const wordData = await getWordData('Generación de proyecto y SOT - CAMBIO DE PLAN.docx');
      const excelData = getExcelData('Deuda_Carterizada.xlsx');
      const pdfData = await getPDFData('GUIA-DE-LLENADO-B02.pdf');

      // Procesar y mostrar los datos de Excel
      if (excelData) {
        Object.keys(excelData).forEach(sheetName => {
          console.log(`Datos de la hoja ${sheetName}:`, excelData[sheetName]);
        });
      }

      await saveDataToMongoDB(wordData, excelData, pdfData);

      this.app.listen(this.port, () => {
        console.log(`Servidor iniciado en el puerto ${this.port} 🚀`);
      });
    } catch (error) {
      console.error('Error al iniciar el servidor:', error.message);
      process.exit(1);
    }
  }

  // Método para manejar mensajes de consulta
  async handleMessage(message) {
    let response;

    try {
      // Buscar en los datos de MongoDB
      const data = await DataModel.findOne().exec();

      if (message.includes('excel')) {
        const searchTerm = message.split('excel ')[1].trim();
        const excelData = data.excelData;

        const searchResults = {};
        Object.keys(excelData).forEach(sheetName => {
          searchResults[sheetName] = excelData[sheetName].filter(row => row.some(cell => cell.includes(searchTerm)));
        });

        response = Object.values(searchResults).flat().length > 0
          ? JSON.stringify(searchResults)
          : 'No se encontraron coincidencias en el archivo Excel.';

      } else if (message.includes('word')) {
        const searchTerm = message.split('word ')[1].trim();
        const wordData = data.wordData;

        response = wordData.includes(searchTerm)
          ? `Se encontró "${searchTerm}" en el archivo Word.`
          : 'No se encontraron coincidencias en el archivo Word.';

      } else if (message.includes('pdf')) {
        const searchTerm = message.split('pdf ')[1].trim();
        const pdfData = data.pdfData;

        const searchResults = pdfData.filter(page => page.some(line => line.includes(searchTerm)));
        response = searchResults.length > 0
          ? `Se encontró "${searchTerm}" en el archivo PDF.`
          : 'No se encontraron coincidencias en el archivo PDF.';

      } else {
        response = 'No entiendo el mensaje. Por favor, intenta de nuevo.';
      }
    } catch (error) {
      console.error('Error al manejar el mensaje:', error.message);
      response = 'Hubo un error al procesar tu solicitud.';
    }

    return response;
  }
}

export default Server;





























