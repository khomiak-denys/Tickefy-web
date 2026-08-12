import { Component } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-shell',
  imports: [],
  templateUrl: './modal-shell.component.html',
  styleUrl: './modal-shell.component.scss',
})
export class ModalShellComponent {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Output() closed = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }
}
