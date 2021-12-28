import {
  Animation,
  AnimationView,
  Color,
  Colors,
  Duration,
} from "icicles-animation";
import { BaseLevelTransformer } from "../base_level_transformer";
import { Codec } from "../codec";

export interface FromTopCodecOptions {
  panelDisabledColor?: Color;
  panelEnabledColor?: Color;
}

export class FromTopCodec extends Codec {
  public get smoothingTimeConstant(): number {
    return 0.35;
  }
  public static readonly minFrameDuration = new Duration({ milliseconds: 20 });

  protected readonly panelEnabledColor: Color;
  protected readonly panelDisabledColor: Color;
  protected readonly baseLevelTransformer: BaseLevelTransformer;

  constructor(animation: Animation, options?: FromTopCodecOptions) {
    super(animation);

    this.baseLevelTransformer = new BaseLevelTransformer();
    this.panelDisabledColor = options?.panelDisabledColor ?? new Color();
    this.panelEnabledColor = options?.panelEnabledColor ?? Colors.white;
  }

  public animate(audioBins: Uint8Array, baseLevel: number): AnimationView {
    const transformedBaseLevel = this.baseLevelTransformer.transform(baseLevel);

    const radioPanelColor = Color.linearBlend(
      this.panelDisabledColor,
      this.panelEnabledColor,
      transformedBaseLevel
    );
    const updatedRadioPanels = this.radioPanels.map((panel) =>
      panel.copyWith({ color: radioPanelColor })
    );
    const audioLevels = new Array(this.xCount);
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

    this.icicles.setAllPixelsColor(new Color());
    const frame = this.icicles.toFrame(Codec.minFrameDuration);

    const half = Math.floor(this.xCount / 2);
    for (let x = 0; x < this.xCount; x++) {
      const level =
        x < half ? audioLevels[half - 1 - x] : audioLevels[x - half];
      const lightsCount = level * this.yCount;

      for (let y = 0; y < lightsCount; y++) {
        const ledIndex = this.icicles.getPixelIndex(x, y);
        frame.pixels[ledIndex] = Color.linearBlend(
          this.panelDisabledColor,
          this.panelEnabledColor,
          level
        );
      }
    }
    return new AnimationView(frame, updatedRadioPanels);
  }
}
