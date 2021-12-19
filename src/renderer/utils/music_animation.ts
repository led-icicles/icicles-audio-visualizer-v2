import {
  Animation,
  AnimationView,
  Color,
  Colors,
  Duration,
  Icicles,
  RadioPanelView,
  VisualFrame,
} from "icicles-animation";

export class MusicAnimation extends Animation {
  constructor(public readonly file: File) {
    super({
      name: file.name,
      xCount: 20,
      yCount: 30,
      radioPanelsCount: 2,
    });
  }

  public audio?: HTMLAudioElement;
  protected basAnalyser?: AnalyserNode;
  protected audioAnalyser?: AnalyserNode;
  protected mediaSource?: MediaElementAudioSourceNode;
  protected context?: AudioContext;

  get duration(): number {
    const duration = this.audio?.duration;
    return duration === undefined || isNaN(duration) ? 0 : duration * 1000; // return in ms
  }

  get size(): number {
    return this.file.size;
  }

  private _frameDuration: number = 20;

  get animationFramesCount(): number {
    return this.duration / this._frameDuration;
  }

  public load() {
    this.dispose();
    this.audio = document.createElement("audio");

    this.context = new AudioContext();
    this.mediaSource = this.context.createMediaElementSource(this.audio);

    this.audioAnalyser = this.context.createAnalyser();
    this.mediaSource.connect(this.audioAnalyser);
    this.audioAnalyser.fftSize = 256;
    this.audioAnalyser.smoothingTimeConstant = 0.35;

    this.basAnalyser = this.context.createAnalyser();
    this.mediaSource.connect(this.basAnalyser);
    this.basAnalyser.connect(this.context.destination);
    this.basAnalyser.smoothingTimeConstant = this.config.temporalSmoothing;
    this.basAnalyser.minDecibels = this.config.minDecibels;
    this.basAnalyser.maxDecibels = this.config.maxDecibels;
    this.basAnalyser.fftSize = this.config.fftSize;
  }

  // TODO Change name, as after dispose this animation can be still used after performing load
  public dispose(): void {
    this.stop();
    this.context?.close();
    this.mediaSource?.disconnect();
    this.audioAnalyser?.disconnect();
    this.basAnalyser?.disconnect();
    this.audio = undefined;
    this.context = undefined;
    this.mediaSource = undefined;
    this.audioAnalyser = undefined;
    this.basAnalyser = undefined;
    this._loaded = false;
  }

  public stop() {
    if (this.audio !== undefined) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  protected icicles = new Icicles(this);

  protected config = {
    // analyzer config
    temporalSmoothing: 0.1,
    minDecibels: -40,
    maxDecibels: -30,
    fftSize: 16384,

    smoothingPasses: 1,
    smoothingPoints: 3,
    startBin: 8,
    keepBins: 40,
  };

  private _loaded = false;

  protected transform = (spectrum: Uint8Array) => {
    let subArr = spectrum.slice(
      this.config.startBin,
      this.config.startBin + this.config.keepBins
    );
    subArr = this.savitskyGolaySmooth(subArr);
    return subArr;
  };

  protected multiplier = (spectrum: Uint8Array) => {
    let sum = 0;
    let len = spectrum.length;
    for (let i = 0; i < len; i++) {
      sum += spectrum[i];
    }
    let intermediate = sum / this.config.keepBins / 256;
    let transformer = 1.2;
    return (
      (1 / (transformer - 1)) *
      (-Math.pow(intermediate, transformer) + transformer * intermediate)
    );
  };

  // not convinced this is a Savitsky-Golay smooth. I'm not sure what it is actually.
  protected savitskyGolaySmooth = (array: Uint8Array) => {
    let lastArray = array;
    let newArr = new Uint8Array(array.length);
    for (let pass = 0; pass < this.config.smoothingPasses; pass++) {
      let sidePoints = Math.floor(this.config.smoothingPoints / 2); // our window is centered so this is both nL and nR
      let cn = 1 / (2 * sidePoints + 1); // constant
      for (let i = 0; i < sidePoints; i++) {
        newArr[i] = lastArray[i];
        newArr[lastArray.length - i - 1] = lastArray[lastArray.length - i - 1];
      }
      for (let i = sidePoints; i < lastArray.length - sidePoints; i++) {
        let sum = 0;
        for (let n = -sidePoints; n <= sidePoints; n++) {
          sum += cn * lastArray[i + n] + n;
        }
        newArr[i] = sum;
      }
      lastArray = newArr;
    }
    return newArr;
  };

  protected val = 0;
  protected color = Colors.orange;
  protected darker = Color.linearBlend(new Color(), this.color, 0.1);

  public *play(): Generator<AnimationView, AnimationView, AnimationView> {
    const intialFrame: VisualFrame = VisualFrame.filled(
      this.header.pixelsCount,
      new Color(0, 0, 0),
      this._frameDuration
    );

    const radioPanels = new Array(this.header.radioPanelsCount)
      .fill(undefined)
      // radio panels indexes starts from 1 (0 is a broadcast channel)
      .map((_, index) => new RadioPanelView(index + 1, new Color()));

    // If object is not loaded
    if (
      !this.audio ||
      !this.basAnalyser ||
      !this.audioAnalyser ||
      !this.mediaSource ||
      !this.context
    ) {
      this.load();
      yield new AnimationView(intialFrame, radioPanels);
    }

    const basBinCounts = this.basAnalyser!.frequencyBinCount;
    const basBins = new Uint8Array(basBinCounts);
    const audioBinCounts = this.audioAnalyser!.frequencyBinCount;
    const audioBins = new Uint8Array(audioBinCounts);

    this.audio!.src = URL.createObjectURL(this.file);
    this.audio!.load();

    this.audio!.play()
      .then((_) => {
        this._loaded = true;
      })
      .catch((_) => {
        console.error("animation play error", _);
        return new AnimationView(intialFrame, radioPanels);
      });

    if (!this._loaded) {
      yield new AnimationView(intialFrame, radioPanels);
    }

    while (!this.audio!.ended) {
      this.basAnalyser!.getByteFrequencyData(basBins);
      this.audioAnalyser!.getByteFrequencyData(audioBins);

      const spectrum = this.transform(basBins.slice(0));
      let mult = Math.pow(this.multiplier(spectrum), 0.8);
      if (mult > 0.7) {
        this.val = 1.0;
      } else if (this.val > 0) {
        this.val -= 0.25;
      }

      if (this.val < 0) {
        this.val = 0;
      }

      const colorToDisplay = Color.linearBlend(
        this.darker,
        this.color,
        this.val
      );

      const updatedRadioPanels = radioPanels.map((p) =>
        p.copyWith({ color: colorToDisplay })
      );

      const levels = new Array(this.header.xCount);
      const binsPerLevel = Math.floor(
        audioBins.length / (this.header.xCount * 2)
      );
      for (let levelIndex = 0; levelIndex < this.header.xCount; levelIndex++) {
        const start = levelIndex * binsPerLevel;
        const end = start + binsPerLevel;

        let sum = 0;
        for (let binIndex = start; binIndex < end; binIndex++) {
          sum += audioBins[binIndex];
        }
        const avg = sum / binsPerLevel;
        const level = avg / 255;
        levels[levelIndex] = level;
      }

      this.icicles.setAllPixelsColor(new Color());
      const frame = this.icicles.toFrame(
        new Duration({ milliseconds: this._frameDuration })
      );
      const half = Math.floor(this.header.xCount / 2);
      for (let x = 0; x < this.header.xCount; x++) {
        const level = x < half ? levels[half - 1 - x] : levels[x - half];
        const lightsCount = level * this.header.yCount;

        for (let y = 0; y < lightsCount; y++) {
          const ledIndex = this.icicles.getPixelIndex(x, y);
          frame.pixels[ledIndex] = Color.linearBlend(
            new Color(255, 0, 0),
            new Color(0, 0, 255),
            level
          );
        }
      }

      yield new AnimationView(frame, updatedRadioPanels);
    }

    this.dispose();
    return new AnimationView(intialFrame, radioPanels);
  }
}
