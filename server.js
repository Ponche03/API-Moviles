const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require('cors');

dotenv.config();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Conectarse a MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.log(err));

// Rutas
app.use("/api", require("./rutas/usuarioRoutes"));
app.use("/api", require("./rutas/gastoRoutes"));
app.use("/api", require("./rutas/ingresoRoutes"));

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor en línea en puerto: ${PORT}`));
