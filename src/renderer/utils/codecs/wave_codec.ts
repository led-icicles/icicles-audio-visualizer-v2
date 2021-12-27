import {
  Animation,
  AnimationView,
  Color,
  Colors,
  Duration,
} from "icicles-animation";
import { BaseLevelTransformer } from "../base_level_transformer";
import { Codec } from "../codec";

export interface WaveCodecOptions {
  panelDisabledColor?: Color;
  panelEnabledColor?: Color;
}

export class WaveCodec extends Codec {
  public get smoothingTimeConstant(): number {
    return 0;
  }
  public static readonly minFrameDuration = new Duration({ milliseconds: 20 });

  protected readonly panelEnabledColor: Color;
  protected readonly panelDisabledColor: Color;
  protected readonly baseLevelTransformer: BaseLevelTransformer;

  protected readonly rows: Array<Array<number>>;

  constructor(animation: Animation, options?: WaveCodecOptions) {
    super(animation);

    this.baseLevelTransformer = new BaseLevelTransformer();
    this.panelDisabledColor = options?.panelDisabledColor ?? new Color();
    this.panelEnabledColor = options?.panelEnabledColor ?? Colors.white;
    this.rows = new Array(this.yCount)
      .fill(undefined)
      .map(() => new Array(this.xCount).fill(0));
  }

  public animate(audioBins: Uint8Array, baseLevel: number): AnimationView {
    const baseValue = this.baseLevelTransformer.transform(baseLevel);

    const radioPanelColor = Color.linearBlend(
      this.panelDisabledColor,
      this.panelEnabledColor,
      baseValue
    );
    const updatedRadioPanels = this.radioPanels.map((panel) =>
      panel.copyWith({ color: radioPanelColor })
    );
    const audioLevels = new Array(this.xCount / 2);
    const binsPerLevel = Math.floor(audioBins.length / (this.xCount * 2));

    for (let levelIndex = 0; levelIndex < this.xCount; levelIndex++) {
      const start = levelIndex * binsPerLevel;
      const end = start + binsPerLevel;

      let sum = 0;
      for (let binIndex = start; binIndex < end; binIndex++) {
        sum += audioBins[binIndex];
      }
      const avg = sum / binsPerLevel;
      const level = avg / 255;
      audioLevels[levelIndex] = level;
    }

    const half = Math.floor(this.xCount / 2);
    const centeredLevels = audioLevels
      .map((_, index) =>
        index < half ? audioLevels[half - 1 - index] : audioLevels[index - half]
      )
      .map((a) => (a - 0.8 < 0 ? 0 : a));

    this.rows.unshift(centeredLevels);
    this.rows.pop();

    this.icicles.setAllPixelsColor(new Color());
    const frame = this.icicles.toFrame(Codec.minFrameDuration);

    for (let x = 0; x < this.xCount; x++) {
      for (let y = 0; y < this.yCount; y++) {
        const color = this.rows[y][x];
        const ledIndex = this.icicles.getPixelIndex(x, y);
        frame.pixels[ledIndex] = Color.linearBlend(
          new Color(0, 0, 0),
          new Color(255, 0, 0),
          color
        );
      }
    }
    return new AnimationView(frame, updatedRadioPanels);
  }
}
