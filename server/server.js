import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const app = express();
const port = process.env.PORT || 3001;

// Configure OpenAI client for Perplexity
const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: "https://api.perplexity.ai"
});

// CORS configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI DevOps Generator API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Generate configuration endpoint
app.post('/api/generate', async (req, res) => {
  const { prompt, useCase } = req.body;

  if (!prompt || !useCase) {
    return res.status(400).json({ 
      error: 'Missing required fields: prompt and useCase' 
    });
  }

  if (!process.env.API_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error: API key not found' 
    });
  }

  try {
    console.log(`[${new Date().toISOString()}] Generating ${useCase} for: ${prompt.substring(0, 50)}...`);
    
    const response = await client.chat.completions.create({
      model: "sonar-pro",
      messages: [
        {
          role: "system", 
          content: "You are an expert DevOps engineer. Generate clean, well-commented, production-ready configurations and scripts following industry best practices."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    const config = response.choices[0].message.content;
    res.json({ config });
    
    console.log(`[${new Date().toISOString()}] Successfully generated ${useCase}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating config:`, error.message);
    res.status(500).json({ 
      error: 'Failed to generate configuration. Please check your API key and try again.' 
    });
  }
});

// Catch all handler for production (serve React app)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${port}`);
  console.log(`🔑 API Key configured: ${process.env.API_KEY ? 'Yes' : 'No'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
