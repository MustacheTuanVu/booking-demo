import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsMultipleOf1000Constraint implements ValidatorConstraintInterface {
  validate(value: any) {
    return typeof value === 'number' && value % 1000 === 0;
  }

  defaultMessage() {
    return 'Giá phải chia hết cho 1000';
  }
}

export function IsMultipleOf1000(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMultipleOf1000Constraint,
    });
  };
}
