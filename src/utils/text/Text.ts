class Text {
  /**
  * Verify if the text provided is a valid URL.
  *
  * @param {string} text - The input text to verify.
  * @returns {boolean} 'True' if the link is a valid URL.
  */
  public static isUrl(text: string): boolean {
    let url: URL;
    try {
      url = new URL(text);
    } catch (_err) {
      return false;
    }
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return true;
    } else {
      return false;
    }
  }
}

export { Text };
