import { describe, it, expect } from 'vitest';

describe('HAPS Clinical Form Validation Logic', () => {
  const schemaMock = [
    { name: 'age', min: 30, max: 80, type: 'int', label: 'Age' },
    { name: 'trestbps', min: 90, max: 180, type: 'int', label: 'Resting Blood Pressure' },
    { name: 'chol', min: 150, max: 300, type: 'int', label: 'Cholesterol' },
    { name: 'oldpeak', min: 0.0, max: 6.0, type: 'float', label: 'ST Depression' }
  ];

  function validateFormData(formData, schema) {
    const errors = {};
    schema.forEach(field => {
      const val = formData[field.name];
      if (val === undefined || val === null || val === '') {
        errors[field.name] = `${field.label} is required`;
        return;
      }
      const num = Number(val);
      if (isNaN(num)) {
        errors[field.name] = 'Must be a valid number';
        return;
      }
      if (field.min !== undefined && num < field.min * 0.8) {
        errors[field.name] = `Value below expected lower bound (${field.min})`;
      } else if (field.max !== undefined && num > field.max * 1.2) {
        errors[field.name] = `Value exceeds expected upper bound (${field.max})`;
      }
    });
    return errors;
  }

  it('passes validation when clinical parameters are within range', () => {
    const validData = {
      age: 55,
      trestbps: 130,
      chol: 220,
      oldpeak: 1.8
    };
    const errors = validateFormData(validData, schemaMock);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('flags missing required fields', () => {
    const incompleteData = {
      age: 50,
      trestbps: 120
      // chol and oldpeak missing
    };
    const errors = validateFormData(incompleteData, schemaMock);
    expect(errors.chol).toBeDefined();
    expect(errors.oldpeak).toBeDefined();
    expect(errors.age).toBeUndefined();
  });

  it('flags physiological values that exceed boundary thresholds', () => {
    const outOfRangeData = {
      age: 120, // exceeds upper limit
      trestbps: 130,
      chol: 50, // below expected lower limit
      oldpeak: 1.5
    };
    const errors = validateFormData(outOfRangeData, schemaMock);
    expect(errors.age).toContain('exceeds expected upper bound');
    expect(errors.chol).toContain('below expected lower bound');
    expect(errors.trestbps).toBeUndefined();
  });
});
