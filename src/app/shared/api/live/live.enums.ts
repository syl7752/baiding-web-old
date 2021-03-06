export enum LiveStatus {
  Null = 0,
  Created,
  Canceled,
  Started,
  Ended
}

export enum LiveType {
  Text = <any>'text',
  Video = <any>'video',
  App = <any>'app',
}

export enum LiveStreamStatus {
  None = <any>'',
  Pushing = <any>'publish',
  Done = <any>'publish_done',
}

export enum LivePublishedStatus {
  Published = 1,
  Draft
}

export enum LivePayType {
  Purchase = 0,
  Present,
}
