/**
 * @abstract
 */
class Command {
  constructor(token, auth) {
    this.token = token,
    this.auth = auth
  }

  /**
   * @abstract
   * @throws {Error} if not implemented
   */
  async action() {
    throw new Error("Abstract method should not be called in the Command base class");
  }
}

export {Command}