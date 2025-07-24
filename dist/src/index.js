"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const homeRoutes_routes_1 = __importDefault(require("./routes/homeRoutes.routes"));
const AuthRoute_routes_1 = __importDefault(require("./routes/AuthRoute.routes")); // Renommé pour plus de clarté
const NewProductRoute_routes_1 = __importDefault(require("./routes/NewProductRoute.routes"));
const Faq_routes_1 = __importDefault(require("./routes/Faq.routes"));
const UserRoute_routes_1 = __importDefault(require("./routes/UserRoute.routes"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const path_1 = __importDefault(require("path"));
const facebookRoutes_1 = __importDefault(require("./routes/facebookRoutes"));
const db_1 = __importDefault(require("./config/db"));
// Chargement des variables d'environnement
dotenv_1.default.config();
// Initialisation de l'application Express
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Configuration CORS
const allowedOrigins = [
    "http://localhost:5173",
    "https://client-chat-boot-app.vercel.app",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        console.log("Origine reçue :", origin);
        if (!origin) {
            // Pour les requêtes sans Origin (ex. OPTIONS ou Postman), autoriser localhost:5173
            callback(null, "http://localhost:5173");
        }
        else if (allowedOrigins.includes(origin)) {
            callback(null, origin);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Gérer les requêtes OPTIONS pour toutes les routes
app.options("*", (0, cors_1.default)()); // Correct, garantit que les requêtes OPTIONS sont gérées
// Middlewares
app.use(express_1.default.json()); // Remplace bodyParser.json(), intégré à Express
app.use(express_1.default.urlencoded({ extended: true })); // Correct, pour les données de formulaires
// Configuration du moteur EJS
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views")); // Correct, définit le dossier des vues
// Fichiers statiques
// Vérifiez que le dossier public existe à l'emplacement ../public par rapport à index.js
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use("/images/products", express_1.default.static(path_1.default.join(__dirname, "../public/images/products")));
app.use("/images/messages", express_1.default.static(path_1.default.join(__dirname, "../public/images/messages")));
// Initialisation de Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"], // Si Socket.IO a besoin d'autres méthodes, ajoutez-les
        credentials: true,
    },
});
exports.io = io;
io.on("connection", (socket) => {
    console.log("🔌 Nouvelle connexion Socket.IO:", socket.id);
    socket.on("disconnect", () => {
        console.log("❌ Déconnexion Socket.IO:", socket.id);
    });
});
// Vérification des variables d’environnement essentielles
// Ajout de JWT_SECRET pour éviter les erreurs dans AuthMiddleware
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.JWT_SECRET) {
    console.error("❌ Variables d'environnement manquantes (DB_HOST, DB_USER, JWT_SECRET).");
    process.exit(1);
}
// Déclaration des routes
// Préfixe /api pour toutes les routes, assurez-vous que le frontend utilise /api/me
app.use("/api", homeRoutes_routes_1.default);
app.use("/", AuthRoute_routes_1.default);
app.use("/api", UserRoute_routes_1.default);
app.use("/api", Faq_routes_1.default);
app.use("/api", NewProductRoute_routes_1.default);
app.use("/api", facebookRoutes_1.default);
// Middleware global pour gérer les erreurs
app.use(errorHandler_1.default);
// Fonction de démarrage du serveur
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test et synchronisation DB avant de démarrer le serveur
        yield db_1.default.authenticate();
        console.log("✅ Connexion à la base de données réussie !");
        yield db_1.default.sync({ alter: true }); // Attention : alter modifie la DB, utiliser avec précaution
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`🚀 Serveur + Socket.IO lancé sur http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Impossible de démarrer le serveur, erreur DB :", error);
        process.exit(1);
    }
});
startServer();
