import { useState, useCallback, useRef, useEffect } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  min?: number;
  max?: number;
}

interface FieldConfig {
  validation?: ValidationRule;
  defaultValue?: any;
  transform?: (value: any) => any;
}

interface FormConfig<T> {
  fields: { [K in keyof T]: FieldConfig };
  onSubmit?: (data: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

interface FormHelpers<T> {
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
  reset: () => void;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  getFieldProps: (field: keyof T) => {
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    error?: string;
    touched?: boolean;
  };
}

// Validation helpers
const validators = {
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },
  
  phone: (value: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/\D/g, '')) ? null : 'Please enter a valid phone number';
  },
  
  url: (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }
};

function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required';
  }
  
  if (!value) return null; // Skip other validations if value is empty and not required
  
  if (rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }
  
  if (rules.maxLength && value.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }
  
  if (rules.min !== undefined && value < rules.min) {
    return `Must be at least ${rules.min}`;
  }
  
  if (rules.max !== undefined && value > rules.max) {
    return `Must be no more than ${rules.max}`;
  }
  
  if (rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }
  
  if (rules.email && validators.email(value)) {
    return validators.email(value);
  }
  
  if (rules.phone && validators.phone(value)) {
    return validators.phone(value);
  }
  
  if (rules.url && validators.url(value)) {
    return validators.url(value);
  }
  
  if (rules.custom) {
    return rules.custom(value);
  }
  
  return null;
}

export function useAdvancedForm<T extends Record<string, any>>(
  config: FormConfig<T>
): FormState<T> & FormHelpers<T> {
  // Initialize default values
  const getInitialValues = useCallback(() => {
    const values = {} as T;
    Object.keys(config.fields).forEach(key => {
      const field = config.fields[key as keyof T];
      values[key as keyof T] = field.defaultValue ?? '';
    });
    return values;
  }, [config.fields]);

  const [values, setValues] = useState<T>(getInitialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValuesRef = useRef<T>(getInitialValues());

  const {
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSubmit = false,
    onSubmit
  } = config;

  // Calculate derived state
  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);

  const setValue = useCallback((field: keyof T, value: any) => {
    const fieldConfig = config.fields[field];
    const transformedValue = fieldConfig.transform ? fieldConfig.transform(value) : value;
    
    setValues(prev => ({ ...prev, [field]: transformedValue }));
    
    if (validateOnChange && fieldConfig.validation) {
      const error = validateField(transformedValue, fieldConfig.validation);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  }, [config.fields, validateOnChange]);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateFieldCallback = useCallback((field: keyof T) => {
    const fieldConfig = config.fields[field];
    if (fieldConfig.validation) {
      const error = validateField(values[field], fieldConfig.validation);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  }, [config.fields, values]);

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isFormValid = true;

    Object.keys(config.fields).forEach(key => {
      const field = key as keyof T;
      const fieldConfig = config.fields[field];
      if (fieldConfig.validation) {
        const error = validateField(values[field], fieldConfig.validation);
        if (error) {
          newErrors[field] = error;
          isFormValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [config.fields, values]);

  const reset = useCallback(() => {
    const initialValues = getInitialValues();
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    initialValuesRef.current = initialValues;
  }, [getInitialValues]);

  const handleChange = useCallback((field: keyof T) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target;
      let value: any;

      if (target.type === 'checkbox') {
        value = (target as HTMLInputElement).checked;
      } else if (target.type === 'number') {
        value = target.value === '' ? '' : Number(target.value);
      } else if (target.type === 'file') {
        value = (target as HTMLInputElement).files;
      } else {
        value = target.value;
      }

      setValue(field, value);
    };
  }, [setValue]);

  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setTouched(prev => ({ ...prev, [field]: true }));
      if (validateOnBlur) {
        validateFieldCallback(field);
      }
    };
  }, [validateOnBlur, validateFieldCallback]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Mark all fields as touched
    const allTouched: Partial<Record<keyof T, boolean>> = {};
    Object.keys(config.fields).forEach(key => {
      allTouched[key as keyof T] = true;
    });
    setTouched(allTouched);

    // Validate form
    const isFormValid = validateForm();
    if (!isFormValid) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit?.(values);
      
      if (resetOnSubmit) {
        reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, config.fields, validateForm, onSubmit, values, resetOnSubmit, reset]);

  const getFieldProps = useCallback((field: keyof T) => {
    return {
      value: values[field] ?? '',
      onChange: handleChange(field),
      onBlur: handleBlur(field),
      error: errors[field],
      touched: touched[field]
    };
  }, [values, handleChange, handleBlur, errors, touched]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setError,
    clearError,
    validateField: validateFieldCallback,
    validateForm,
    reset,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps
  };
}

// Pre-built validation rules
export const validationRules = {
  required: { required: true },
  email: { required: true, email: true },
  password: { required: true, minLength: 6 },
  phone: { phone: true },
  url: { url: true },
  positiveNumber: { min: 0 },
  percentage: { min: 0, max: 100 },
  
  // Common patterns
  zipCode: { pattern: /^\d{5}(-\d{4})?$/ },
  creditCard: { pattern: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/ },
  ssn: { pattern: /^\d{3}-?\d{2}-?\d{4}$/ },
};