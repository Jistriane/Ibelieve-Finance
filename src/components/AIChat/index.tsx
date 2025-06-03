import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Psychology as AnalysisIcon,
} from '@mui/icons-material';
import { analyzeWithOllama } from '../../services/ollama';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  analysis?: {
    riskScore?: number;
    efficiencyScore?: number;
    fraudScore?: number;
    recommendations?: string[];
  };
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMessage = async (text: string): Promise<Message['analysis']> => {
    try {
      return await analyzeWithOllama(text);
    } catch (error) {
      console.error('Erro na análise:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const analysis = await analyzeMessage(input);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Analisei sua solicitação. Aqui está o resultado:',
        sender: 'bot',
        timestamp: new Date(),
        analysis,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setError('Erro ao obter resposta do assistente. Verifique se o Ollama está rodando.');
      console.error('Erro ao obter resposta:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BotIcon color="primary" />
        Assistente Virtual
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ flex: 1, overflow: 'auto', mb: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <List>
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem
                sx={{
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  gap: 1,
                  py: 1,
                }}
              >
                {message.sender === 'bot' ? (
                  <BotIcon color="primary" />
                ) : (
                  <PersonIcon color="action" />
                )}
                <ListItemText
                  primary={
                    <Box>
                      <Typography>{message.text}</Typography>
                      {message.analysis && (
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<AnalysisIcon />}
                              label={`Risco: ${message.analysis.riskScore}%`}
                              color={message.analysis.riskScore >= 50 ? 'success' : 'error'}
                            />
                            <Chip
                              icon={<AnalysisIcon />}
                              label={`Eficiência: ${message.analysis.efficiencyScore}%`}
                              color="primary"
                            />
                            <Chip
                              icon={<AnalysisIcon />}
                              label={`Fraude: ${message.analysis.fraudScore}%`}
                              color={message.analysis.fraudScore < 10 ? 'success' : 'warning'}
                            />
                          </Box>
                          {message.analysis.recommendations && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Recomendações:
                              </Typography>
                              {message.analysis.recommendations.map((rec, index) => (
                                <Typography key={index} variant="body2" sx={{ mt: 0.5 }}>
                                  • {rec}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  }
                  secondary={message.timestamp.toLocaleTimeString()}
                  sx={{
                    textAlign: message.sender === 'user' ? 'right' : 'left',
                    bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                    p: 1,
                    borderRadius: 1,
                    maxWidth: '80%',
                    '& .MuiListItemText-primary': {
                      wordBreak: 'break-word',
                    },
                  }}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default AIChat; 