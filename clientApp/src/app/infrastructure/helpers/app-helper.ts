export class AppHelper {
  static getBaseUrl() {
    console.log(document.getElementsByTagName('base')[0].href);
    return document.getElementsByTagName('base')[0].href;
  }

  static getServerUrl() {
    return '127.0.0.1:8000';
  }
}
