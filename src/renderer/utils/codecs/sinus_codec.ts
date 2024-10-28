import { Animation, AnimationView, Color, Colors } from "icicles-animation";
import { BaseLevelTransformer } from "../base_level_transformer";
import { Codec } from "../codec";

export interface MusicWaveCodecOptions {
  waveColor?: Color;
  backgroundColor?: Color;
  panelDisabledColor?: Color;
  panelEnabledColor?: Color;
}

export class MusicWaveCodec extends Codec {
  public get smoothingTimeConstant(): number {
    return 0;
  }
  protected readonly waveColor: Color;
  protected readonly backgroundColor: Color;
  protected readonly panelDisabledColor: Color;
  protected readonly panelEnabledColor: Color;
  protected readonly baseLevelTransformer: BaseLevelTransformer;
  protected phase = 0;

  constructor(animation: Animation, options?: MusicWaveCodecOptions) {
    super(animation);

    this.waveColor = options?.waveColor ?? Colors.blue;
    this.backgroundColor = options?.backgroundColor ?? new Color(0, 0, 0);
    this.panelDisabledColor = options?.panelDisabledColor ?? new Color();
    this.panelEnabledColor = options?.panelEnabledColor ?? Colors.red;
    this.baseLevelTransformer = new BaseLevelTransformer();
  }

  public animate(audioBins: Uint8Array, baseLevel: number): AnimationView {
    const frame = this.icicles.toFrame(Codec.minFrameDuration);

    // Clear the frame with the background color
    this.icicles.setAllPixelsColor(this.backgroundColor);

    // Transform the baseLevel for panel color
    const transformedBaseLevel = this.baseLevelTransformer.transform(baseLevel);
    const radioPanelColor = Color.linearBlend(
      this.panelDisabledColor,
      this.panelEnabledColor,
      transformedBaseLevel
    );

    // Update the radio panels
    const updatedRadioPanels = this.radioPanels.map((panel) =>
      panel.copyWith({ color: radioPanelColor })
    );

    // Calculate amplitude using the maximum audio bin value
    const maxBinValue = Math.max(...audioBins);
    const amplitudeScalingFactor = 1.5; // Adjust this value as needed
    let amplitude = (maxBinValue / 255) * amplitudeScalingFactor;
    amplitude = Math.min(1, amplitude); // Ensure amplitude does not exceed 1

    // Map amplitude to a scaling factor for the wave height
    const waveAmplitude = amplitude * ((this.yCount - 1) / 2);

    // Calculate average frequency from the audioBins
    let frequencySum = 0;
    let amplitudeSum = 0;
    const binCount = audioBins.length;
    for (let i = 0; i < binCount; i++) {
      const value = audioBins[i] / 255; // Normalize to 0-1
      frequencySum += value * i;
      amplitudeSum += value;
    }
    const avgBinIndex = frequencySum / amplitudeSum || 0; // Weighted average bin index

    // Map avgBinIndex to a frequency in radians per x unit
    const maxFrequency = Math.PI * 4; // Max frequency (4 full cycles over the display width)
    const minFrequency = Math.PI / 8; // Min frequency
    const frequencyRange = maxFrequency - minFrequency;
    const frequencyNormalized = avgBinIndex / binCount; // 0-1
    const waveFrequency = minFrequency + frequencyRange * frequencyNormalized;

    // Draw the sine wave
    for (let x = 0; x < this.xCount; x++) {
      // Calculate the y position using the sine function
      const y = Math.round(
        waveAmplitude *
          Math.sin(
            waveFrequency * (x / this.xCount) * 2 * Math.PI + this.phase
          ) +
          (this.yCount - 1) / 2
      );

      // Ensure y is within the display range
      if (y >= 0 && y < this.yCount) {
        const ledIndex = this.icicles.getPixelIndex(x, y);
        frame.pixels[ledIndex] = this.waveColor;
      }
    }

    // Update the phase for animation
    this.phase += 0.1; // Adjust the speed of the wave animation

    return new AnimationView(frame, updatedRadioPanels);
  }
}
