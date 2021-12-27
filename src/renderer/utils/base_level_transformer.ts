export class BaseLevelTransformer {
  private _value: number = 0;
  public get value(): number {
    return this._value;
  }

  public transform(level: number): number {
    if (level > 0.7) {
      this._value = 1.0;
    } else if (this._value > 0) {
      this._value -= 0.25;
    }

    if (this._value < 0) {
      this._value = 0;
    }

    return this._value;
  }
}
