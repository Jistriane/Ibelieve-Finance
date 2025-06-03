import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  useTheme,
  alpha,
  Collapse,
  Fade,
  Tooltip
} from '@mui/material';
import {
  Send,
  SmartToy,
  Close,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { sendMessage, clearMessages } from '../store/slices/aiSlice';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIVirtualAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.ai.messages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user' as const,
      timestamp: new Date()
    };

    dispatch(sendMessage(userMessage));
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma-mistral',
          prompt: input,
          stream: false,
        }),
      });

      const data = await response.json();
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai' as const,
        timestamp: new Date()
      };

      dispatch(sendMessage(aiMessage));
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        sender: 'ai' as const,
        timestamp: new Date()
      };
      dispatch(sendMessage(errorMessage));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: isExpanded ? 400 : 'auto',
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Assistente Virtual
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={isExpanded ? 'Recolher' : 'Expandir'}>
            <IconButton
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ color: 'inherit' }}
            >
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Limpar conversa">
            <IconButton
              size="small"
              onClick={() => dispatch(clearMessages())}
              sx={{ color: 'inherit' }}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Box
          sx={{
            height: 400,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.map((message) => (
            <Fade key={message.id} in={true}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    maxWidth: '80%',
                    background: message.sender === 'user'
                      ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      : alpha(theme.palette.background.paper, 0.5),
                    color: message.sender === 'user'
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                    border: message.sender === 'user'
                      ? 'none'
                      : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem',
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
            </Fade>
          ))}
          {isTyping && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                borderRadius: 2,
                background: alpha(theme.palette.background.paper, 0.5),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                alignSelf: 'flex-start',
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Digitando...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: 'flex',
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
              '&.Mui-disabled': {
                background: alpha(theme.palette.primary.main, 0.3),
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AIVirtualAssistant; 