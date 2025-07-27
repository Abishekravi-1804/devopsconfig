import { useState } from 'react';
import { generateConfigAPI } from '../services/api/configGenerator';

export const useConfigGenerator = () => {
  const [useCase, setUseCase] = useState('Dockerfile');
  const [techStack, setTechStack] = useState('');
  const [environment, setEnvironment] = useState('Development');
  const [includeSecurity, setIncludeSecurity] = useState(true);
  const [addMonitoring, setAddMonitoring] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      const config = await generateConfigAPI(prompt, useCase);
      setGeneratedConfig(config);
    } catch (err) {
      setError('Error generating configuration. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    useCase,
    setUseCase,
    techStack,
    setTechStack,
    environment,
    setEnvironment,
    includeSecurity,
    setIncludeSecurity,
    addMonitoring,
    setAddMonitoring,
    showAdvanced,
    setShowAdvanced,
    generatedConfig,
    isLoading,
    error,
    generateConfig
  };
};
