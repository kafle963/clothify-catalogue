// Test file to verify image upload functionality
import { processImageFiles, validateImageFile, createImagePreview } from '../src/utils/imageUpload';

// This is a simple test to verify our utilities work correctly
console.log('Image upload utilities test loaded successfully!');

// Test validation function
const testValidation = () => {
  // Create a mock file object for testing
  const mockFile = {
    name: 'test.jpg',
    type: 'image/jpeg',
    size: 1024 * 1024, // 1MB
  } as File;

  const validation = validateImageFile(mockFile);
  console.log('Validation test result:', validation);
  
  return validation.valid;
};

// Export for potential testing
export { testValidation };