import ObjectLiteral from '@shared/types/object-literal.type';

type Error = {
  field: string;
  message: string;
};

export const createValidationError = (validationError: ObjectLiteral) => {
  const errors: Error[] = [];

  for (const [key, value] of Object.entries(validationError)) {
    errors.push({
      field: key,
      message: value[0],
    });
  }

  return errors;
};
