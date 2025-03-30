require('dotenv').config(); //Manejar variables de entorno
const express = require('express'); //Servidor
const axios = require('axios'); //Manejar consultas http
const path = require('path');
const cors = require('cors'); //Manejar peticiones en el frontend

const app = express(); //Inicializar servidor
const PORT = process.env.PORT || 3000; //Crear puerto


app.use(cors()); // Habilitar CORS para permitir peticiones desde el frontend

//Cargar archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

let pricesArray = []; //Array key-value: crypto-precio

async function updatePrices() {
  try {
    //Documentación de CoinCap: https://docs.coincap.io/#89deffa0-ab03-4e0a-8d92-637a857d2c91
    const response = await axios.get('https://api.coincap.io/v2/assets?limit=21');
    const data = response.data.data; // Extraer el array de criptos

    //Convertirlo a crypto-precio
    //La función reduce se utiliza para reducir un array a un valor
    pricesArray = data.reduce((acc, coin) => {
      acc[coin.id] = { usd: coin.priceUsd, percentaje: coin.changePercent24Hr }; 
      return acc;
    }, {});
console.log(pricesArray);
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
}

// Llamar a la función una vez al inicio
updatePrices();
// Luego actualizar cada 2 segundos para actualizar pricesArray
setInterval(updatePrices, 2000);

//API llamada desde el HTML
app.get('/api/prices', (req, res) => {
  try {
    res.json(pricesArray);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo datos' });
  }
});

// Ruta para cargar index.html por defecto
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor y abrir automáticamente en el navegador (Usando nodemon server.js)
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  openBrowser(`http://localhost:${PORT}`);
});

// Función para abrir el navegador automáticamente
function openBrowser(url) {
  const start = process.platform === 'darwin' ? 'open' :
    process.platform === 'win32' ? 'start' :
      'xdg-open';
  require('child_process').exec(start + ' ' + url);
}
