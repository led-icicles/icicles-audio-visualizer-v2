import {
  AdditiveFrame,
  Animation,
  AnimationView,
  Color,
  Colors,
  DelayFrame,
  Duration,
  Icicles,
  RadioColorFrame,
  RadioPanelView,
  VisualFrame,
} from "icicles-animation";

export class MusicAnimation extends Animation {
  constructor(public readonly file: File) {
    super({
      name: file.name,
      xCount: 20,
      yCount: 30,
    });
  }

  protected readonly audio = document.createElement("audio");
  protected analyser: AnalyserNode;

  public async load() {
    // var audio = document.getElementById("audio") as HTMLAudioElement;

    var context = new AudioContext();
    const mediaSource = context.createMediaElementSource(this.audio);

    this.analyser = context.createAnalyser();
    mediaSource.connect(this.analyser);
    this.analyser.connect(context.destination);
    this.analyser.smoothingTimeConstant = this.config.temporalSmoothing;
    this.analyser.minDecibels = this.config.minDecibels;
    this.analyser.maxDecibels = this.config.maxDecibels;
    this.analyser.fftSize = this.config.fftSize;
  }

  protected startTime = Date.now();

  protected icicles = new Icicles(
    new Animation({
      name: "1",
      xCount: 20,
      yCount: 30,
      loopsCount: 0,
    })
  );

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
  // I'm not convinced this is a Savitsky-Golay smooth. I'm not sure what it is actually.
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
      20
    );

    const radioPanels = new Array(this.header.radioPanelsCount)
      .fill(undefined)
      // radio panels indexes starts from 1 (0 is a broadcast channel)
      .map((_, index) => new RadioPanelView(index + 1, new Color()));

    var bufferLength = this.analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    this.audio.src = URL.createObjectURL(this.file);
    this.audio.load();
    this.audio
      .play()
      .then((_) => {
        this._loaded = true;
      })
      .catch((_) => {
        console.error("animation play error", _);
        return new AnimationView(intialFrame, radioPanels);
      });

    if (!this._loaded) {
      yield new AnimationView(intialFrame.copy(), radioPanels);
    }

    while (!this.audio.ended) {
      this.analyser.getByteFrequencyData(dataArray);

      const spectrum = this.transform(dataArray);
      let mult = Math.pow(this.multiplier(spectrum), 0.8);
      if (mult > 0.6) {
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

      this.icicles.setPixels(this.icicles.pixels.map((_, i) => colorToDisplay));
      const frame = this.icicles.toFrame(new Duration({ milliseconds: 20 }));
      yield new AnimationView(frame, radioPanels);
    }

    return new AnimationView(intialFrame, radioPanels);
  }
}

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

// console.log("icicles", icicles);

// (window as any).native.receive("fromMain", (data: any) => {
//   console.log(`Received ${data} from main process`);
// });
// (window as any).native.send("toMain", "some data");
// window.onload = function () {
//   var file = document.getElementById("thefile") as HTMLInputElement;
//   var audio = document.getElementById("audio") as HTMLAudioElement;

//   var context = new AudioContext();
//   const mediaSource = context.createMediaElementSource(audio);

//   var analyser = context.createAnalyser();
//   mediaSource.connect(analyser);
//   analyser.connect(context.destination);
//   analyser.smoothingTimeConstant = Config.temporalSmoothing;
//   analyser.minDecibels = Config.minDecibels;
//   analyser.maxDecibels = Config.maxDecibels;
//   analyser.fftSize = Config.fftSize;

//   file.onchange = function () {
//     var files = (this as any).files as Array<File>;
//     audio.src = URL.createObjectURL(files[0]);
//     audio.load();
//     audio.play();

//     var canvas = document.getElementById("canvas") as HTMLCanvasElement;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     var ctx = canvas.getContext("2d");

//     var bufferLength = analyser.frequencyBinCount;
//     console.log("bufferLength", bufferLength);

//     var dataArray = new Uint8Array(bufferLength);

//     var WIDTH = canvas.width;
//     var HEIGHT = canvas.height;

//     var barWidth = (WIDTH / bufferLength) * 2.5;
//     var barHeight;
//     var x = 0;

//     function renderFrame() {
//       requestAnimationFrame(renderFrame);

//       x = 0;

//       analyser.getByteFrequencyData(dataArray);

//       ctx.fillStyle = "#000";
//       ctx.fillRect(0, 0, WIDTH, HEIGHT);

//       if (Date.now() - startTime > 20) {
//         (window as any).native.send("toMain", dataArray);
//         startTime = Date.now();
//       }

//       return;
//     }

//     audio.play();
//     renderFrame();
//   };
// };
