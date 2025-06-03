import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';

const About: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sobre o Ibelieve Finance
        </Typography>

        <Typography variant="body1" paragraph align="center" sx={{ mb: 6 }}>
          Uma plataforma inovadora de empréstimos descentralizada, construída com tecnologia blockchain
          para oferecer transparência, segurança e eficiência.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Nossa Missão
                </Typography>
                <Typography variant="body1" paragraph>
                  Democratizar o acesso a empréstimos através da tecnologia blockchain,
                  eliminando intermediários e reduzindo custos para nossos usuários.
                </Typography>
                <Typography variant="body1">
                  Acreditamos que a tecnologia blockchain pode transformar o mercado
                  financeiro tradicional, tornando-o mais acessível e transparente.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Nossa Visão
                </Typography>
                <Typography variant="body1" paragraph>
                  Ser a principal plataforma de empréstimos descentralizada,
                  reconhecida pela inovação, segurança e excelência no atendimento.
                </Typography>
                <Typography variant="body1">
                  Buscamos constantemente melhorar nossa plataforma e expandir
                  nossos serviços para atender às necessidades de nossos usuários.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Nossos Valores
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>
                      Transparência
                    </Typography>
                    <Typography variant="body2">
                      Todas as transações são registradas na blockchain,
                      garantindo total transparência e rastreabilidade.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>
                      Segurança
                    </Typography>
                    <Typography variant="body2">
                      Utilizamos as mais avançadas tecnologias de segurança
                      para proteger os dados e ativos de nossos usuários.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>
                      Inovação
                    </Typography>
                    <Typography variant="body2">
                      Estamos sempre em busca de novas tecnologias e soluções
                      para melhorar a experiência de nossos usuários.
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default About; 