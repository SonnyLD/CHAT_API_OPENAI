import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
  wordData: {
    type: String,
    required: true,
  },
  excelData: {
    type: [[String]],
    validate: {
      validator: function(arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: 'El campo excelData debe ser una matriz de cadenas no vacía.'
    },
    required: false,
  },
  pdfData: {
    type: [[[String]]],
    validate: {
      validator: function(arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: 'El campo pdfData debe ser una matriz de matrices de cadenas no vacía.'
    },
    required: false,
  }
});

const DataModel = mongoose.model('Data', dataSchema);

export default DataModel;


