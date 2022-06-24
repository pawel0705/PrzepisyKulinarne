import { Injectable } from '@angular/core';
import { ButtonModalModel } from 'src/app/infrastructure/models/button-modal.model';
declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  public visible: boolean;

  public headerText: string;
  public bodyText: string;
  public modalClasses: string;

  public submitButton: ButtonModalModel;
  public abortButton: ButtonModalModel;

  constructor() {
    this.visible = false;

    let submitButton = new ButtonModalModel(
      'confirmation-modal-submit-button',
      'Ok',
      'btn-green'
    );
    let abortButton = new ButtonModalModel(
      'confirmation-modal-abort-button',
      'Anuluj',
      'btn-secondary'
    );

    this.createConfirmModal(
      '',
      '',
      'main-confirm-modal-element',
      submitButton,
      abortButton
    );
  }

  createConfirmBase = (
    title: string,
    body: string,
    confirmLabel: string,
    abortLabel: string,
    onConfirmSubmit: () => void,
    onConfirmAbort: () => void
  ): void => {
    let submitButton = new ButtonModalModel(
      'confirmation-modal-submit-button',
      confirmLabel,
      'btn-green',
      onConfirmSubmit
    );
    let abortButton = new ButtonModalModel(
      'confirmation-modal-abort-button',
      abortLabel,
      'btn-secondary',
      onConfirmAbort
    );

    this.createConfirmModal(title, body, '', submitButton, abortButton);
    this.show();
  };

  private createConfirmModal = (
    modalHeader: string,
    modalBody: string,
    modalClasses: string,
    submitBtn: ButtonModalModel,
    abortBtn: ButtonModalModel,
    showModal: boolean = false
  ): void => {
    this.modalClasses = modalClasses;
    if (modalHeader != null && modalHeader.length != 0) {
      this.headerText = modalHeader;
    } else {
      this.headerText = '&#8205';
    }

    this.bodyText = modalBody;
    this.submitButton = submitBtn;
    this.abortButton = abortBtn;

    if (showModal) this.show();
  };

  private show() {
    $('#confirmationModal').modal('show');
  }
}
