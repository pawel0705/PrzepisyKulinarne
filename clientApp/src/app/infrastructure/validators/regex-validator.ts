export class RegexValidator {
  public validate = (value: any, expr: string): boolean => {
    let regex = new RegExp(expr);
    return regex.test(value);
  };
}
