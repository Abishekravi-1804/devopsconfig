import { fileExtensions } from './constants';

export const downloadFile = (content, useCase) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = `${useCase.toLowerCase().replace(/\s+/g, '_')}${fileExtensions[useCase] || '.txt'}`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
