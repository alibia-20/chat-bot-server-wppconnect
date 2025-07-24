import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import homeRoutes from "./routes/homeRoutes.routes";
import AuthRoute from "./routes/AuthRoute.routes"; // Renommé pour plus de clarté
import newProductRoute from "./routes/NewProductRoute.routes";
import Faq from "./routes/Faq.routes";
import UserRoute from "./routes/UserRoute.routes";
import errorHandler from "./middleware/errorHandler";
import path from "path";
import facebookRoutes from "./routes/facebookRoutes";
import sequelize from "./config/db";

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const server = http.createServer(app);

// Configuration CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://client-chat-boot-app.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Origine reçue :", origin);
      if (!origin) {
        // Pour les requêtes sans Origin (ex. OPTIONS ou Postman), autoriser localhost:5173
        callback(null, "http://localhost:5173");
      } else if (allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Gérer les requêtes OPTIONS pour toutes les routes
app.options("*", cors()); // Correct, garantit que les requêtes OPTIONS sont gérées

// Middlewares
app.use(express.json()); // Remplace bodyParser.json(), intégré à Express
app.use(express.urlencoded({ extended: true })); // Correct, pour les données de formulaires

// Configuration du moteur EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Correct, définit le dossier des vues

// Fichiers statiques
// Vérifiez que le dossier public existe à l'emplacement ../public par rapport à index.js
app.use(express.static(path.join(__dirname, "../public")));
app.use(
  "/images/products",
  express.static(path.join(__dirname, "../public/images/products"))
);
app.use(
  "/images/messages",
  express.static(path.join(__dirname, "../public/images/messages"))
);

// Initialisation de Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"], // Si Socket.IO a besoin d'autres méthodes, ajoutez-les
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Nouvelle connexion Socket.IO:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Déconnexion Socket.IO:", socket.id);
  });
});

export { io };

// Vérification des variables d’environnement essentielles
// Ajout de JWT_SECRET pour éviter les erreurs dans AuthMiddleware
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.JWT_SECRET) {
  console.error(
    "❌ Variables d'environnement manquantes (DB_HOST, DB_USER, JWT_SECRET)."
  );
  process.exit(1);
}

// Déclaration des routes
// Préfixe /api pour toutes les routes, assurez-vous que le frontend utilise /api/me
app.use("/api", homeRoutes);
app.use("/", AuthRoute);
app.use("/api", UserRoute);
app.use("/api", Faq);
app.use("/api", newProductRoute);
app.use("/api", facebookRoutes);

// Middleware global pour gérer les erreurs
app.use(errorHandler);

// Fonction de démarrage du serveur
const startServer = async () => {
  try {
    // Test et synchronisation DB avant de démarrer le serveur
    await sequelize.authenticate();
    console.log("✅ Connexion à la base de données réussie !");
    await sequelize.sync({ alter: true }); // Attention : alter modifie la DB, utiliser avec précaution
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Serveur + Socket.IO lancé sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Impossible de démarrer le serveur, erreur DB :", error);
    process.exit(1);
  }
};

startServer();
