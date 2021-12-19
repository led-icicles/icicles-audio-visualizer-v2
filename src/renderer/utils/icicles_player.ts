import { AnimationView } from "icicles-animation";

export class IciclesPlayer
  implements Generator<AnimationView, AnimationView, AnimationView>
{
  constructor(
    public readonly player: Generator<
      AnimationView,
      AnimationView,
      AnimationView
    >
  ) {}

  next(...args: []): IteratorResult<AnimationView, AnimationView> {
    const data = this.player.next();
    const view = data.value;
    // TODO: extract from here
    (window as any).native.send("displayView", view.toBytes());
    return data;
  }

  return(value: AnimationView): IteratorResult<AnimationView, AnimationView> {
    return this.player.return(value);
  }
  throw(e: any): IteratorResult<AnimationView, AnimationView> {
    return this.player.return(e);
  }
  [Symbol.iterator](): Generator<AnimationView, AnimationView, AnimationView> {
    return this.player;
  }

  public stop(): void {
    // TODO: extract from here
    (window as any).native.send("iciclesEnd");
  }
}
