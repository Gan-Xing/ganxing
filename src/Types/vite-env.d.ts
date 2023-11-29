interface ImportMeta {
  readonly globEager: <T>(globPattern: string) => Record<string, T>;
}
