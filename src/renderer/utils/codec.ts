import {
  Animation,
  AnimationView,
  Color,
  Duration,
  Icicles,
  RadioPanelView,
} from "icicles-animation";

export abstract class Codec {
  public static readonly minFrameDuration = new Duration({ milliseconds: 20 });

  public abstract get smoothingTimeConstant(): number;
  protected readonly icicles: Icicles;
  protected readonly radioPanels: Array<RadioPanelView>;

  public get xCount(): number {
    return this.animation.header.xCount;
  }
  public get yCount(): number {
    return this.animation.header.yCount;
  }

  constructor(public readonly animation: Animation) {
    this.icicles = new Icicles(animation);
    this.radioPanels = new Array(animation.header.radioPanelsCount)
      .fill(undefined)
      // radio panels indexes starts from 1 (0 is a broadcast channel)
      .map((_, index) => new RadioPanelView(index + 1, new Color()));
  }

  public abstract animate(
    audioBins: Uint8Array,
    baseLevel: number
  ): AnimationView;
}
