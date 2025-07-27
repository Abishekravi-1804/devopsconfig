import React, { useState } from 'react';
import axios from 'axios';
import { 
  Settings, 
  Download, 
  Rocket, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  BookOpen
} from 'lucide-react';
import './App.css';

const useCaseOptions = {
  "Dockerfile": "Container configuration for your application",
  "GitHub Actions Workflow": "CI/CD pipeline for automated testing & deployment", 
  "Shell Script": "Automation scripts for setup and deployment",
  "Docker Compose": "Multi-container application orchestration",
  "Kubernetes Deployment": "Container orchestration manifests",
  "Jenkins Pipeline": "CI/CD pipeline for Jenkins"
};

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

  const generateConfig = async () => {
    if (!techStack.trim()) {
      setError('Please describe your technology stack first!');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedConfig('');

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
      const response = await axios.post('/api/generate', {
        prompt,
        useCase
      });
      
      setGeneratedConfig(response.data.config);
    } catch (err) {
      setError('Error generating configuration. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadConfig = () => {
    const fileExtensions = {
      "Dockerfile": ".dockerfile",
      "GitHub Actions Workflow": ".yml",
      "Shell Script": ".sh",
      "Docker Compose": ".yml",
      "Kubernetes Deployment": ".yaml",
      "Jenkins Pipeline": ".groovy"
    };

    const element = document.createElement('a');
    const file = new Blob([generatedConfig], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${useCase.toLowerCase().replace(/\s+/g, '_')}${fileExtensions[useCase] || '.txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1 className="title">
            <Settings className="title-icon" />
            AI DevOps Script & Config Generator
          </h1>
          <p className="subtitle">
            Generate production-ready DevOps configurations and scripts using AI. 
            Perfect for automating container deployments, CI/CD pipelines, and infrastructure setup.
          </p>
        </div>
      </header>

      <div className="container main-content">
        <div className="content-grid">
          {/* Sidebar */}
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

          {/* Main Content */}
          <main className="main-panel">
            <div className="panel-grid">
              {/* Configuration Panel */}
              <div className="config-panel">
                <h2>Configuration Options</h2>
                
                <div className="form-group">
                  <label htmlFor="useCase">What do you want to generate?</label>
                  <select 
                    id="useCase"
                    value={useCase} 
                    onChange={(e) => setUseCase(e.target.value)}
                    className="select-input"
                  >
                    {Object.keys(useCaseOptions).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <p className="help-text">📝 {useCaseOptions[useCase]}</p>
                </div>

                <div className="form-group">
                  <label htmlFor="techStack">Technology Stack & Requirements:</label>
                  <textarea
                    id="techStack"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="Example: Python 3.11 FastAPI app, uses PostgreSQL database, runs on port 8000, needs Redis for caching"
                    rows={4}
                    className="textarea-input"
                  />
                  <p className="help-text">
                    Describe your application stack, dependencies, ports, and any special requirements
                  </p>
                </div>

                {/* Advanced Options */}
                <div className="advanced-section">
                  <button 
                    className="advanced-toggle"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    ⚙️ Advanced Options {showAdvanced ? '▼' : '▶'}
                  </button>
                  
                  {showAdvanced && (
                    <div className="advanced-options">
                      <div className="form-group">
                        <label htmlFor="environment">Target Environment:</label>
                        <select 
                          id="environment"
                          value={environment} 
                          onChange={(e) => setEnvironment(e.target.value)}
                          className="select-input"
                        >
                          <option value="Development">Development</option>
                          <option value="Staging">Staging</option>
                          <option value="Production">Production</option>
                        </select>
                      </div>

                      <div className="checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={includeSecurity}
                            onChange={(e) => setIncludeSecurity(e.target.checked)}
                          />
                          <span>Include security best practices</span>
                        </label>
                        
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={addMonitoring}
                            onChange={(e) => setAddMonitoring(e.target.checked)}
                          />
                          <span>Add monitoring/logging setup</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Output Panel */}
              <div className="output-panel">
                <h2>Generated Output</h2>
                
                <div className="generate-section">
                  <button 
                    onClick={generateConfig}
                    disabled={isLoading}
                    className="generate-button"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="spinning" size={16} />
                        AI is generating...
                      </>
                    ) : (
                      <>
                        <Rocket size={16} />
                        Generate Configuration
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {generatedConfig && (
                  <div className="output-section">
                    <div className="success-message">
                      <CheckCircle size={16} />
                      Configuration generated successfully!
                    </div>
                    
                    <div className="code-container">
                      <pre className="code-block">
                        <code>{generatedConfig}</code>
                      </pre>
                    </div>
                    
                    <button onClick={downloadConfig} className="download-button">
                      <Download size={16} />
                      Download Configuration
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Educational Section */}
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

      {/* Footer */}
      <footer className="footer">
        <p> Devops config generator using api  </p>
      </footer>
    </div>
  );
}

export default App;
