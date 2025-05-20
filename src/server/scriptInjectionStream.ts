export default class ScriptInjectionStream extends TransformStream<
  Uint8Array,
  Uint8Array
> {
  scriptInjected: boolean = false;
  dehydratedString: string | null = null;
  userDtoString: string | null = null;

  constructor(dehydratedString: string | null, userDtoString: string | null) {
    super({
      transform: (chunk, controller) => this.transformChunk(chunk, controller),
      flush: (controller) => this.flushStream(controller),
    });
    this.dehydratedString = dehydratedString;
    this.userDtoString = userDtoString;
  }

  transformChunk(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Uint8Array>,
  ) {
    controller.enqueue(chunk);
    if (!this.scriptInjected && this.dehydratedString !== null) {
      const script = `<script>window.__QUERY_STATE__ = ${this.dehydratedString};window.__USER_DATA__ = ${this.userDtoString}</script>`;
      controller.enqueue(new TextEncoder().encode(script));
      this.scriptInjected = true;
    }
  }

  flushStream(controller: TransformStreamDefaultController<Uint8Array>) {
    if (!this.scriptInjected && this.dehydratedString !== null) {
      const script = `<script>window.__QUERY_STATE__ = ${this.dehydratedString};window.__USER_DATA__ = ${this.userDtoString}</script>`;
      controller.enqueue(new TextEncoder().encode(script));
    }
  }
}
