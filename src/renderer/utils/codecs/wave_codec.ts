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

  protected readonly panelEnabledColor: Color;
  protected readonly panelDisabledColor: Color;
  protected readonly baseLevelTransformer: BaseLevelTransformer;

  protected readonly rows: Array<Array<number>>;

  constructor(animation: Animation, options?: WaveCodecOptions) {
    super(animation);

    this.baseLevelTransformer = new BaseLevelTransformer();
    this.panelDisabledColor = options?.panelDisabledColor ?? new Color();
    this.panelEnabledColor = options?.panelEnabledColor ?? Colors.red;
    this.rows = new Array(this.xCount)
      .fill(undefined)
      .map(() => new Array(this.yCount).fill(0));
  }

  public animate(audioBins: Uint8Array, baseLevel: number): AnimationView {
    const level = this.baseLevelTransformer.transform(baseLevel);
    const radioPanelColor = Color.linearBlend(
      this.panelDisabledColor,
      this.panelEnabledColor,
      level
    );
    const updatedRadioPanels = this.radioPanels.map((panel) =>
      panel.copyWith({ color: radioPanelColor })
    );

    const half = Math.floor(this.yCount / 2);
    const value = Math.floor(baseLevel * half);

    const audioLevels = new Array(this.xCount).fill(0);

    for (let i = 0; i < half; i++) {
      const leftIndex = half - i - 1;
      const rightIndex = half + i;
      const validLevel = i < value ? 1 : 0;
      audioLevels[leftIndex] = validLevel;
      audioLevels[rightIndex] = validLevel;
    }

    this.rows.push(audioLevels);
    this.rows.shift();

    this.icicles.setAllPixelsColor(new Color());
    const frame = this.icicles.toFrame(Codec.minFrameDuration);

    for (let x = 0; x < this.xCount; x++) {
      for (let y = 0; y < this.yCount; y++) {
        const color = this.rows[x][y];
        const ledIndex = this.icicles.getPixelIndex(x, y);
        frame.pixels[ledIndex] = Color.linearBlend(
          this.panelDisabledColor,
          this.panelEnabledColor,
          color
        );
      }
    }
    return new AnimationView(frame, updatedRadioPanels);
  }
}
