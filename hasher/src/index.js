"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const metrics_1 = require("./utils/metrics");
const logger_1 = require("./utils/logger");
const security_1 = require("./utils/security");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middlewares
app.use(express_1.default.json());
app.use((0, compression_1.default)());
app.use(security_1.apiLimiter);
// Rotas
app.use('/api', routes_1.default);
// Endpoint de métricas
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', metrics_1.register.contentType);
        res.end(await metrics_1.register.metrics());
    }
    catch (error) {
        logger_1.logger.error('Erro ao obter métricas:', error);
        res.status(500).end();
    }
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Tratamento de erros
app.use((err, req, res, next) => {
    logger_1.logger.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});
// Iniciar servidor
app.listen(port, () => {
    logger_1.logger.info(`Servidor rodando na porta ${port}`);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUE4QjtBQUM5Qiw4REFBc0M7QUFDdEMsNkNBQTJDO0FBQzNDLDJDQUF3QztBQUN4QywrQ0FBOEM7QUFDOUMsc0RBQThCO0FBRTlCLE1BQU0sR0FBRyxHQUFHLElBQUEsaUJBQU8sR0FBRSxDQUFDO0FBQ3RCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztBQUV0QyxjQUFjO0FBQ2QsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFBLHFCQUFXLEdBQUUsQ0FBQyxDQUFDO0FBQ3ZCLEdBQUcsQ0FBQyxHQUFHLENBQUMscUJBQVUsQ0FBQyxDQUFDO0FBRXBCLFFBQVE7QUFDUixHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxnQkFBTSxDQUFDLENBQUM7QUFFeEIsdUJBQXVCO0FBQ3ZCLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDckMsSUFBSSxDQUFDO1FBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsa0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sa0JBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsZUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLENBQUM7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILGVBQWU7QUFDZixHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUM5QixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxzQkFBc0I7QUFDdEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQVEsRUFBRSxHQUFvQixFQUFFLEdBQXFCLEVBQUUsSUFBMEIsRUFBRSxFQUFFO0lBQzVGLGVBQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDO0FBQzlELENBQUMsQ0FBQyxDQUFDO0FBRUgsbUJBQW1CO0FBQ25CLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtJQUNwQixlQUFNLENBQUMsSUFBSSxDQUFDLDZCQUE2QixJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgY29tcHJlc3Npb24gZnJvbSAnY29tcHJlc3Npb24nO1xuaW1wb3J0IHsgcmVnaXN0ZXIgfSBmcm9tICcuL3V0aWxzL21ldHJpY3MnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHsgYXBpTGltaXRlciB9IGZyb20gJy4vdXRpbHMvc2VjdXJpdHknO1xuaW1wb3J0IHJvdXRlcyBmcm9tICcuL3JvdXRlcyc7XG5cbmNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcbmNvbnN0IHBvcnQgPSBwcm9jZXNzLmVudi5QT1JUIHx8IDMwMDA7XG5cbi8vIE1pZGRsZXdhcmVzXG5hcHAudXNlKGV4cHJlc3MuanNvbigpKTtcbmFwcC51c2UoY29tcHJlc3Npb24oKSk7XG5hcHAudXNlKGFwaUxpbWl0ZXIpO1xuXG4vLyBSb3Rhc1xuYXBwLnVzZSgnL2FwaScsIHJvdXRlcyk7XG5cbi8vIEVuZHBvaW50IGRlIG3DqXRyaWNhc1xuYXBwLmdldCgnL21ldHJpY3MnLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICByZXMuc2V0KCdDb250ZW50LVR5cGUnLCByZWdpc3Rlci5jb250ZW50VHlwZSk7XG4gICAgcmVzLmVuZChhd2FpdCByZWdpc3Rlci5tZXRyaWNzKCkpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcignRXJybyBhbyBvYnRlciBtw6l0cmljYXM6JywgZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNTAwKS5lbmQoKTtcbiAgfVxufSk7XG5cbi8vIEhlYWx0aCBjaGVja1xuYXBwLmdldCgnL2hlYWx0aCcsIChyZXEsIHJlcykgPT4ge1xuICByZXMuanNvbih7IHN0YXR1czogJ29rJyB9KTtcbn0pO1xuXG4vLyBUcmF0YW1lbnRvIGRlIGVycm9zXG5hcHAudXNlKChlcnI6IGFueSwgcmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pID0+IHtcbiAgbG9nZ2VyLmVycm9yKCdFcnJvIG7Do28gdHJhdGFkbzonLCBlcnIpO1xuICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRXJybyBpbnRlcm5vIGRvIHNlcnZpZG9yJyB9KTtcbn0pO1xuXG4vLyBJbmljaWFyIHNlcnZpZG9yXG5hcHAubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgbG9nZ2VyLmluZm8oYFNlcnZpZG9yIHJvZGFuZG8gbmEgcG9ydGEgJHtwb3J0fWApO1xufSk7ICJdfQ==