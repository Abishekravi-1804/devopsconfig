import express from 'express';
import cors from 'cors';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const app = express();
const port = process.env.PORT || 3001;

// --- AWS BEDROCK CONFIGURATION ---
// Initialize the Bedrock Client
// Ensure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION are in your .env file
const client = new BedrockRuntimeClient({ 
  region: process.env.AWS_REGION || "us-east-1" 
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
    message: 'AI DevOps Generator API is running (AWS Bedrock Edition)',
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

  if (!process.env.AWS_ACCESS_KEY_ID) {
    return res.status(500).json({ 
      error: 'Server configuration error: AWS credentials not found' 
    });
  }

  try {
    console.log(`[${new Date().toISOString()}] Generating ${useCase} for: ${prompt.substring(0, 50)}...`);

    // 1. Construct the payload for Claude 3 Haiku
    // This is the specific format Anthropic models expect on Bedrock
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      system: "You are an expert DevOps engineer. Generate clean, well-commented, production-ready configurations and scripts following industry best practices.",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt }
          ]
        }
      ],
      temperature: 0.3
    };

    // 2. Create the command
    // Model ID: Claude 3 Haiku (Fastest & Cheapest)
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    // 3. Invoke the model
    const response = await client.send(command);

    // 4. Decode and Parse Response
    const decodedResponseBody = new TextDecoder().decode(response.body);
    const responseBody = JSON.parse(decodedResponseBody);
    
    // Extract the text content
    const configText = responseBody.content[0].text;

    res.json({ config: configText });
    
    console.log(`[${new Date().toISOString()}] Successfully generated ${useCase}`);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating config:`, error);
    
    // Check for specific AWS errors
    let errorMessage = 'Failed to generate configuration.';
    if (error.name === 'AccessDeniedException') {
      errorMessage = 'AWS Access Denied. Check your IAM permissions or Model Access.';
    } else if (error.name === 'ThrottlingException') {
      errorMessage = 'AWS Request Limit Exceeded. Try again later.';
    }

    res.status(500).json({ 
      error: errorMessage,
      details: error.message
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
  console.log(`☁️  AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
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
