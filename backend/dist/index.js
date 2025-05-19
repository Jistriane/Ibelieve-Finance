"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const proofs_1 = __importDefault(require("./routes/proofs"));
dotenv_1.default.config({ path: process.env.NODE_ENV === 'development' ? '.env-dev' : '.env' });
const app = (0, express_1.default)();
const port = process.env.PORT || 3003;
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express_1.default.json());
app.use('/api/proofs', proofs_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
//# sourceMappingURL=index.js.map