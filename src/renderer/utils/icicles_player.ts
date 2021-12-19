import {
  Animation,
  AnimationView,
  Color,
  RadioPanelView,
  VisualFrame,
} from "icicles-animation";
import { MusicAnimation } from "./music_animation";
// @ts-ignore
import Stats from "stats-js";

type UpdateCallback = (currentFrame: number) => void;

export class IciclesPlayer {
  public _stats = new Stats();
  constructor() {
    this._view = this._getBlankView();
    this._stats.showPanel(0);
  }

  private _isPlaying = false;
  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  private readonly _animations: Array<Animation> = [];
  public get animations(): Array<Animation> {
    return this._animations;
  }
  private _currentAnimation?: Animation;
  public get currentAnimation(): Animation | undefined {
    return this._currentAnimation;
  }

  public get xCount(): number {
    return this.currentAnimation?.header.xCount ?? 20;
  }
  public get yCount(): number {
    return this.currentAnimation?.header.yCount ?? 30;
  }

  public get pixelsCont(): number {
    return this.xCount * this.yCount;
  }

  public get radioPanelsCount(): number {
    return this._currentAnimation?.header.radioPanelsCount ?? 2;
  }

  private _currentAnimationIndex: number = 0;
  public get currentAnimationIndex(): number {
    return this._currentAnimationIndex;
  }
  private _currentFrame: number = 0;
  public get currentFrame(): number {
    return this._currentFrame;
  }

  private _view: AnimationView;

  public get view(): AnimationView {
    return this._view;
  }

  public get progress(): number {
    const currentAnimation = this.currentAnimation;
    if (currentAnimation === undefined) return 0;

    if (currentAnimation instanceof MusicAnimation) {
      return (
        currentAnimation.audio.currentTime / currentAnimation.audio.duration
      );
    } else {
      return this.currentFrame / currentAnimation.animationFramesCount;
    }
  }

  public setProgress(progress: number): void {
    if (this.currentAnimation instanceof MusicAnimation) {
      const duration = this.currentAnimation.audio.duration;
      this.currentAnimation.audio.currentTime = duration * progress;
    }
  }

  private readonly _listeners: Array<UpdateCallback> = [];
  public addListener = (listener: UpdateCallback) => {
    const includes = this._listeners.includes(listener);
    if (includes) {
      throw new Error("Already present");
    } else {
      this._listeners.push(listener);
    }
  };

  public removeListener = (listener: UpdateCallback) => {
    const index = this._listeners.indexOf(listener);
    if (index < 0) {
      throw new Error("Listener does not exists.");
    }

    this._listeners.splice(index, 1);
  };

  private _notifyListeners() {
    for (let i = 0; i < this._listeners.length; i++) {
      this._listeners[i](this._currentFrame);
    }
  }

  private _getBlankView = () =>
    new AnimationView(
      VisualFrame.filled(this.pixelsCont, new Color(), 16),
      new Array(this.radioPanelsCount)
        .fill(undefined)
        .map((_, i) => new RadioPanelView(i + 1, new Color()))
    );

  public play = (animations?: Array<Animation>): void => {
    if (this._isPlaying === true) {
      this.stop();
    }

    if (animations !== undefined) {
      if (animations.length === 0) {
        throw new Error("At least one animation is required.");
      }
      this._animations.length = 0;
      this._animations.push(...animations);
    } else if (this._animations.length === 0) {
      throw new Error("Nothing to play");
    }

    this._isPlaying = true;
    this.onPlayNext(this._animations[0]);
    this._play();
  };

  private _timeout?: NodeJS.Timeout;
  private _player?: Generator<AnimationView, AnimationView, AnimationView>;

  private _play = () => {
    if (this._player === undefined) {
      throw new Error("Player is not defined");
    }
    this._stats.begin();
    const { value: view, done } = this._player.next();
    this._stats.end();
    if (done) {
      this.onAnimationEnd();
      return;
    }

    this.onNewView(view);

    /// schedule next frame
    this._timeout = setTimeout(this._play, view.frame.duration);
  };

  protected onPlayNext(animation: Animation): void {
    this._currentFrame = 0;
    this._currentAnimation = animation;
    this._player = this._currentAnimation.play();
  }

  protected onNewView = (view: AnimationView) => {
    this._currentFrame++;
    this._notifyListeners();
    this._view = view;
    (window as any).native.send("displayView", view.toBytes());
  };

  protected onAnimationEnd = () => {
    this._clearTimeout();
    this._isPlaying = false;
    /// TODO: Add next animation support
    this.stop();
  };

  private _clearTimeout = () => {
    if (this._timeout !== undefined) {
      clearTimeout(this._timeout);
      this._timeout = undefined;
    }
  };

  public stop = (): void => {
    this._clearTimeout();
    this._view = this._getBlankView();
    this._player = undefined;
    this._isPlaying = false;
    this._currentFrame = 0;
    this._notifyListeners();
    if (this.currentAnimation! instanceof MusicAnimation) {
      (this.currentAnimation as MusicAnimation).stop();
    }
    // TODO: add disconect function
    (window as any).native.send("iciclesEnd");
  };
}
