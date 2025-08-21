import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { createContext, authenticateToken } from './middleware/auth';
import { pool, closePool } from './database/config';

// Load environment variables
dotenv.config();

async function startServer() {
  // Create Express app
  const app = express();
  const httpServer = http.createServer(app);

  // Security middleware
  app.use(
    helmet({
      ...(process.env.NODE_ENV === 'production'
        ? {}
        : { contentSecurityPolicy: false }),
      crossOriginEmbedderPolicy: false,
    })
  );

  // Logging middleware
  app.use(morgan('combined'));

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: process.env.NODE_ENV !== 'production',
    formatError: (formattedError, error) => {
      console.error('GraphQL Error:', error);
      return {
        ...formattedError,
        message: formattedError.message,
        code: formattedError.extensions?.code,
        path: formattedError.path || [],
      };
    },
  });

  // Start the server
  await server.start();

  // Apply middleware
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: corsOrigins,
      credentials: true,
    }),
    express.json({ limit: '50mb' }),
    authenticateToken,
    (expressMiddleware as any)(server, {
      context: createContext,
    })
  );

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Test database connection
  app.get('/db-health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.status(200).json({ status: 'Database connected' });
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ status: 'Database connection failed' });
    }
  });

  const PORT = process.env.PORT || 4000;

  // Start HTTP server
  httpServer.listen(Number(PORT), () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`📊 Health check at http://localhost:${PORT}/health`);
    console.log(`💾 Database health at http://localhost:${PORT}/db-health`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await server.stop();
    await closePool();
    httpServer.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await server.stop();
    await closePool();
    httpServer.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});