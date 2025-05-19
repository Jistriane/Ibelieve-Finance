"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.auditLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_elasticsearch_1 = require("winston-elasticsearch");
// Configuração do formato de log
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json());
// Configuração do logger
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'hasher-api' },
    transports: [
        // Log no console
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        }),
        // Log em arquivo
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Log no Elasticsearch
        new winston_elasticsearch_1.ElasticsearchTransport({
            level: 'info',
            index: 'hasher-logs',
            clientOpts: {
                node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
                auth: {
                    username: process.env.ELASTICSEARCH_USER || 'elastic',
                    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
                }
            },
            indexPrefix: 'hasher-logs',
            indexSuffixPattern: 'YYYY.MM.DD',
            ensureIndexTemplate: true,
            indexTemplate: {
                settings: {
                    number_of_shards: 1,
                    number_of_replicas: 1
                },
                mappings: {
                    properties: {
                        timestamp: { type: 'date' },
                        level: { type: 'keyword' },
                        message: { type: 'text' },
                        service: { type: 'keyword' },
                        metadata: { type: 'object' }
                    }
                }
            }
        })
    ]
});
// Função para log de auditoria
exports.auditLogger = winston_1.default.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'hasher-audit' },
    transports: [
        new winston_elasticsearch_1.ElasticsearchTransport({
            level: 'info',
            index: 'hasher-audit',
            clientOpts: {
                node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
                auth: {
                    username: process.env.ELASTICSEARCH_USER || 'elastic',
                    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
                }
            },
            indexPrefix: 'hasher-audit',
            indexSuffixPattern: 'YYYY.MM.DD',
            ensureIndexTemplate: true,
            indexTemplate: {
                settings: {
                    number_of_shards: 1,
                    number_of_replicas: 1
                },
                mappings: {
                    properties: {
                        timestamp: { type: 'date' },
                        action: { type: 'keyword' },
                        user: { type: 'keyword' },
                        resource: { type: 'keyword' },
                        status: { type: 'keyword' },
                        metadata: { type: 'object' }
                    }
                }
            }
        })
    ]
});
// Adiciona um stream para o Morgan
exports.stream = {
    write: (message) => {
        exports.logger.info(message.trim());
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHNEQUE4QjtBQUM5QixpRUFBK0Q7QUFFL0QsaUNBQWlDO0FBQ2pDLE1BQU0sU0FBUyxHQUFHLGlCQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FDdEMsaUJBQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQzFCLGlCQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUN0QixDQUFDO0FBRUYseUJBQXlCO0FBQ1osUUFBQSxNQUFNLEdBQUcsaUJBQU8sQ0FBQyxZQUFZLENBQUM7SUFDekMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLE1BQU07SUFDdEMsTUFBTSxFQUFFLFNBQVM7SUFDakIsV0FBVyxFQUFFLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRTtJQUN0QyxVQUFVLEVBQUU7UUFDVixpQkFBaUI7UUFDakIsSUFBSSxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7WUFDN0IsTUFBTSxFQUFFLGlCQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FDNUIsaUJBQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQ3pCLGlCQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUN4QjtTQUNGLENBQUM7UUFDRixpQkFBaUI7UUFDakIsSUFBSSxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7WUFDMUIsUUFBUSxFQUFFLGdCQUFnQjtZQUMxQixLQUFLLEVBQUUsT0FBTztZQUNkLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTTtZQUN4QixRQUFRLEVBQUUsQ0FBQztTQUNaLENBQUM7UUFDRixJQUFJLGlCQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztZQUMxQixRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTTtZQUN4QixR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InNvdXJjZXNDb250ZW50IjpbImltcG9ydCB3aW5zdG9uIGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IHsgRWxhc3RpY3NlYXJjaFRyYW5zcG9ydCB9IGZyb20gJ3dpbnN0b24tZWxhc3RpY3NlYXJjaCc7XG5cbi8vIENvbmZpZ3VyYcOnw6NvIGRvIGZvcm1hdG8gZGUgbG9nXG5jb25zdCBsb2dGb3JtYXQgPSB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxuICB3aW5zdG9uLmZvcm1hdC50aW1lc3RhbXAoKSxcbiAgd2luc3Rvbi5mb3JtYXQuanNvbigpXG4pO1xuXG4vLyBDb25maWd1cmHDp8OjbyBkbyBsb2dnZXJcbmV4cG9ydCBjb25zdCBsb2dnZXIgPSB3aW5zdG9uLmNyZWF0ZUxvZ2dlcih7XG4gIGxldmVsOiBwcm9jZXNzLmVudi5MT0dfTEVWRUwgfHwgJ2luZm8nLFxuICBmb3JtYXQ6IGxvZ0Zvcm1hdCxcbiAgZGVmYXVsdE1ldGE6IHsgc2VydmljZTogJ2hhc2hlci1hcGknIH0sXG4gIHRyYW5zcG9ydHM6IFtcbiAgICAvLyBMb2cgbm8gY29uc29sZVxuICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSh7XG4gICAgICBmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgIHdpbnN0b24uZm9ybWF0LmNvbG9yaXplKCksXG4gICAgICAgIHdpbnN0b24uZm9ybWF0LnNpbXBsZSgpXG4gICAgICApXG4gICAgfSksXG4gICAgLy8gTG9nIGVtIGFycXVpdm9cbiAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkZpbGUoe1xuICAgICAgZmlsZW5hbWU6ICdsb2dzL2Vycm9yLmxvZycsXG4gICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgIG1heHNpemU6IDUyNDI4ODAsIC8vIDVNQlxuICAgICAgbWF4RmlsZXM6IDUsXG4gICAgfSksXG4gICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5GaWxlKHtcbiAgICAgIGZpbGVuYW1lOiAnbG9ncy9jb21iaW5lZC5sb2cnLFxuICAgICAgbWF4c2l6ZTogNTI0Mjg4MCwgLy8gNU1CXG4gICAgICBtYXhGaWxlczogNSxcbiAgICB9KSxcbiAgICAvLyBMb2cgbm8gRWxhc3RpY3NlYXJjaFxuICAgIG5ldyBFbGFzdGljc2VhcmNoVHJhbnNwb3J0KHtcbiAgICAgIGxldmVsOiAnaW5mbycsXG4gICAgICBpbmRleDogJ2hhc2hlci1sb2dzJyxcbiAgICAgIGNsaWVudE9wdHM6IHtcbiAgICAgICAgbm9kZTogcHJvY2Vzcy5lbnYuRUxBU1RJQ1NFQVJDSF9VUkwgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6OTIwMCcsXG4gICAgICAgIGF1dGg6IHtcbiAgICAgICAgICB1c2VybmFtZTogcHJvY2Vzcy5lbnYuRUxBU1RJQ1NFQVJDSF9VU0VSIHx8ICdlbGFzdGljJyxcbiAgICAgICAgICBwYXNzd29yZDogcHJvY2Vzcy5lbnYuRUxBU1RJQ1NFQVJDSF9QQVNTV09SRCB8fCAnY2hhbmdlbWUnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpbmRleFByZWZpeDogJ2hhc2hlci1sb2dzJyxcbiAgICAgIGluZGV4U3VmZml4UGF0dGVybjogJ1lZWVkuTU0uREQnLFxuICAgICAgZW5zdXJlSW5kZXhUZW1wbGF0ZTogdHJ1ZSxcbiAgICAgIGluZGV4VGVtcGxhdGU6IHtcbiAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICBudW1iZXJfb2Zfc2hhcmRzOiAxLFxuICAgICAgICAgIG51bWJlcl9vZl9yZXBsaWNhczogMVxuICAgICAgICB9LFxuICAgICAgICBtYXBwaW5nczoge1xuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHRpbWVzdGFtcDogeyB0eXBlOiAnZGF0ZScgfSxcbiAgICAgICAgICAgIGxldmVsOiB7IHR5cGU6ICdrZXl3b3JkJyB9LFxuICAgICAgICAgICAgbWVzc2FnZTogeyB0eXBlOiAndGV4dCcgfSxcbiAgICAgICAgICAgIHNlcnZpY2U6IHsgdHlwZTogJ2tleXdvcmQnIH0sXG4gICAgICAgICAgICBtZXRhZGF0YTogeyB0eXBlOiAnb2JqZWN0JyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgXVxufSk7XG5cbi8vIEZ1bsOnw6NvIHBhcmEgbG9nIGRlIGF1ZGl0b3JpYVxuZXhwb3J0IGNvbnN0IGF1ZGl0TG9nZ2VyID0gd2luc3Rvbi5jcmVhdGVMb2dnZXIoe1xuICBsZXZlbDogJ2luZm8nLFxuICBmb3JtYXQ6IGxvZ0Zvcm1hdCxcbiAgZGVmYXVsdE1ldGE6IHsgc2VydmljZTogJ2hhc2hlci1hdWRpdCcgfSxcbiAgdHJhbnNwb3J0czogW1xuICAgIG5ldyBFbGFzdGljc2VhcmNoVHJhbnNwb3J0KHtcbiAgICAgIGxldmVsOiAnaW5mbycsXG4gICAgICBpbmRleDogJ2hhc2hlci1hdWRpdCcsXG4gICAgICBjbGllbnRPcHRzOiB7XG4gICAgICAgIG5vZGU6IHByb2Nlc3MuZW52LkVMQVNUSUNTRUFSQ0hfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0OjkyMDAnLFxuICAgICAgICBhdXRoOiB7XG4gICAgICAgICAgdXNlcm5hbWU6IHByb2Nlc3MuZW52LkVMQVNUSUNTRUFSQ0hfVVNFUiB8fCAnZWxhc3RpYycsXG4gICAgICAgICAgcGFzc3dvcmQ6IHByb2Nlc3MuZW52LkVMQVNUSUNTRUFSQ0hfUEFTU1dPUkQgfHwgJ2NoYW5nZW1lJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaW5kZXhQcmVmaXg6ICdoYXNoZXItYXVkaXQnLFxuICAgICAgaW5kZXhTdWZmaXhQYXR0ZXJuOiAnWVlZWS5NTS5ERCcsXG4gICAgICBlbnN1cmVJbmRleFRlbXBsYXRlOiB0cnVlLFxuICAgICAgaW5kZXhUZW1wbGF0ZToge1xuICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgIG51bWJlcl9vZl9zaGFyZHM6IDEsXG4gICAgICAgICAgbnVtYmVyX29mX3JlcGxpY2FzOiAxXG4gICAgICAgIH0sXG4gICAgICAgIG1hcHBpbmdzOiB7XG4gICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgdGltZXN0YW1wOiB7IHR5cGU6ICdkYXRlJyB9LFxuICAgICAgICAgICAgYWN0aW9uOiB7IHR5cGU6ICdrZXl3b3JkJyB9LFxuICAgICAgICAgICAgdXNlcjogeyB0eXBlOiAna2V5d29yZCcgfSxcbiAgICAgICAgICAgIHJlc291cmNlOiB7IHR5cGU6ICdrZXl3b3JkJyB9LFxuICAgICAgICAgICAgc3RhdHVzOiB7IHR5cGU6ICdrZXl3b3JkJyB9LFxuICAgICAgICAgICAgbWV0YWRhdGE6IHsgdHlwZTogJ29iamVjdCcgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIF1cbn0pO1xuXG4vLyBBZGljaW9uYSB1bSBzdHJlYW0gcGFyYSBvIE1vcmdhblxuZXhwb3J0IGNvbnN0IHN0cmVhbSA9IHtcbiAgd3JpdGU6IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICBsb2dnZXIuaW5mbyhtZXNzYWdlLnRyaW0oKSk7XG4gIH1cbn07ICJdfQ==