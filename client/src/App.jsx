import React, { useState } from 'react';
import axios from 'axios';
import { Settings, Download, Rocket, AlertCircle, CheckCircle, Loader, BookOpen, DollarSign, Server } from 'lucide-react';
import { useCaseOptions } from './utils/constants';
import { downloadFile } from './utils/fileDownload';
import './App.css';

// Assume useCaseOptions is defined in './utils/constants' as an object:
// export const useCaseOptions = {
//   'Dockerfile': 'Creates a multi-stage Dockerfile for containerization.',
//   'Jenkinsfile': 'Generates a CI/CD pipeline script for Jenkins.',
//   'Terraform': 'Writes Infrastructure as Code for cloud resources.',
//   // ... other options
// };

function App() {
  const [useCase, setUseCase] = useState('Dockerfile');
  const [techStack, setTechStack] = useState('');
  const [environment, setEnvironment] = useState('Development');
  const [includeSecurity, setIncludeSecurity] = useState(true);
  const [addMonitoring, setAddMonitoring] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tokenStats, setTokenStats] = useState(null);

  const generateConfig = async () => {
    // 1. Input Validation
    if (!techStack.trim()) {
      setError('Please describe your technology stack first!');
      return;
    }
    setIsLoading(true);
    setError('');
    setGeneratedConfig('');
    setTokenStats(null);

    const prompt = `Write a complete ${useCase} for this technology stack: ${techStack}.
Target environment: ${environment}
${includeSecurity ? "Include security best practices and comments." : ""}
${addMonitoring ? "Include monitoring and logging setup." : ""}
Requirements:
- Add helpful comments explaining each section
- Follow industry best practices
- Make it production-ready
- Include error handling where applicable`;

    try {
      const response = await axios.post('/api/generate', { prompt, useCase });
      const resultText = response.data.config;
      setGeneratedConfig(resultText);

      // 2. Token Calculation Correction: Assuming the backend provides actual token usage is better,
      // but if not, the string length/4 is a simple estimate. The original calculation is retained
      // but should be noted as an *estimate*.
      const inputTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(resultText.length / 4);
      const totalTokens = inputTokens + outputTokens;
      // Cost calculation is based on custom rates (e.g., input=$0.25/M, output=$1.25/M)
      const cost = ((inputTokens * 0.25 + outputTokens * 1.25) / 1000000).toFixed(6);
      setTokenStats({ input: inputTokens, output: outputTokens, total: totalTokens, cost: cost });

    } catch (err) {
      // 3. Improved Error Logging/Message
      const errorMessage = err.response?.data?.message || 'Error generating configuration. Please check if backend is running.';
      setError(errorMessage);
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="title">
            <Settings className="title-icon" />
            AI DevOps Script & Config Generator
          </h1>
          <p className="subtitle">Generate production-ready DevOps configurations and scripts using AI. Perfect for automating container deployments, CI/CD pipelines, and infrastructure setup.</p>
        </div>
      </header>
      <div className="container main-content">
        <div className="content-grid">
          <aside className="sidebar">
            <div className="sidebar-section">
              <h3>📋 How to Use</h3>
              <ol className="instructions">
                <li><strong>Select</strong> the type of config/script you need</li>
                <li><strong>Describe</strong> your technology stack clearly</li>
                <li><strong>Click Generate</strong> to get AI-powered results</li>
                <li><strong>Copy & customize</strong> the output for your project</li>
              </ol>
            </div>
            <div className="sidebar-section">
              <h3>💡 Pro Tips</h3>
              <div className="tip-box">
                <p><strong>Be specific with your requirements:</strong></p>
                <ul>
                  <li>Mention exact versions (e.g., Python 3.11, Node 18)</li>
                  <li>Include frameworks (Flask, Express, Spring Boot)</li>
                  <li>Specify ports, environment variables</li>
                  <li>Note any special dependencies</li>
                </ul>
              </div>
            </div>
            <div className="sidebar-section">
              <div className="warning-box">
                <AlertCircle size={16} />
                <span>Always review generated configs before using in production!</span>
              </div>
            </div>
          </aside>
          <main className="main-panel">
            <div className="panel-grid">
              <div className="config-panel">
                <h2>Configuration Options</h2>
                <div className="form-group">
                  <label htmlFor="useCase">What do you want to generate?</label>
                  <select id="useCase" value={useCase} onChange={(e) => setUseCase(e.target.value)} className="select-input">
                    {/* Ensure useCaseOptions has the correct structure for Object.keys to work */}
                    {Object.keys(useCaseOptions).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {/* Ensure useCaseOptions[useCase] exists */}
                  <p className="help-text">📝 {useCaseOptions[useCase] || 'Select a use case to see its description.'}</p>
                </div>
                <div className="form-group">
                  <label htmlFor="techStack">Technology Stack & Requirements:</label>
                  <textarea id="techStack" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="Example: AWS Infrastructure using Terraform, VPC with 2 public subnets, EC2 instance t3.micro, S3 bucket for logs" rows={4} className="textarea-input" />
                  <p className="help-text">Describe your application stack, dependencies, ports, and any special requirements</p>
                </div>
                <div className="advanced-section">
                  <button className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                    ⚙️ Advanced Options {showAdvanced ? '▼' : '▶'}
                  </button>
                  {showAdvanced && (
                    <div className="advanced-options">
                      <div className="form-group">
                        <label htmlFor="environment">Target Environment:</label>
                        <select id="environment" value={environment} onChange={(e) => setEnvironment(e.target.value)} className="select-input">
                          <option value="Development">Development</option>
                          <option value="Staging">Staging</option>
                          <option value="Production">Production</option>
                        </select>
                      </div>
                      <div className="checkbox-group">
                        <label className="checkbox-label">
                          <input type="checkbox" checked={includeSecurity} onChange={(e) => setIncludeSecurity(e.target.checked)} />
                          <span>Include security best practices</span>
                        </label>
                        <label className="checkbox-label">
                          <input type="checkbox" checked={addMonitoring} onChange={(e) => setAddMonitoring(e.target.checked)} />
                          <span>Add monitoring/logging setup</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="output-panel">
                <h2>Generated Output</h2>
                <div className="generate-section">
                  <button onClick={generateConfig} disabled={isLoading} className="generate-button">
                    {isLoading ? (
                      <span><Loader className="spinning" size={16} /> AI is generating...</span>
                    ) : (
                      <span><Rocket size={16} /> Generate Configuration</span>
                    )}
                  </button>
                </div>
                {error && <div className="error-message"><AlertCircle size={16} />{error}</div>}
                {generatedConfig && (
                  <div className="output-section">
                    <div className="success-message">
                      <CheckCircle size={16} />
                      Configuration generated successfully!
                    </div>
                    {tokenStats && (
                      <div className="token-stats">
                        <div className="stat-item">
                          <Server size={16} />
                          <span>Tokens: {tokenStats.total} ({tokenStats.input} in / {tokenStats.output} out)</span>
                        </div>
                        <div className="stat-item">
                          <DollarSign size={16} />
                          <span>Cost: ${tokenStats.cost}</span>
                        </div>
                      </div>
                    )}
                    <div className="code-container">
                      {/* CORRECTED: Removed the misplaced `de>` and `</code>` tags */}
                      <pre className="code-block">
                        {generatedConfig}
                      </pre>
                    </div>
                    <button onClick={() => downloadFile(generatedConfig, useCase)} className="download-button">
                      <Download size={16} />
                      Download Configuration
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
        <section className="educational-section">
          <details className="learn-more">
            <summary>
              <BookOpen size={16} />
              📚 Learn More About This Project
            </summary>
            <div className="learning-content">
              <h3>What You're Learning:</h3>
              <ul>
                <li><strong>Vite + React:</strong> Modern, fast development setup</li>
                <li><strong>API Integration:</strong> Connecting to AI services</li>
                <li><strong>Prompt Engineering:</strong> Crafting effective AI instructions</li>
                <li><strong>Modern React:</strong> Hooks, state management, and best practices</li>
                <li><strong>DevOps Automation:</strong> Generating infrastructure configurations</li>
                <li><strong>Error Handling:</strong> Managing API failures gracefully</li>
              </ul>
            </div>
          </details>
        </section>
      </div>
      <footer className="footer">
        <p>Devops config generator using AWS Bedrock</p>
      </footer>
    </div>
  );
}

export default App;