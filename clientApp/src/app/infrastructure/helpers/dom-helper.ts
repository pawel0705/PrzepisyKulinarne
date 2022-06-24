declare var $: any;

export class DomHelper {
  static scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  static initTooltips() {
    $('[data-toggle="tooltip"]').tooltip();
  }
}
