// Because "got" is an ES module with lots of deps,
// use this mock to avoid to get a lot of Babel translations in the node_modules directory.

class RequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "RequestError";
  }
}

export { RequestError };