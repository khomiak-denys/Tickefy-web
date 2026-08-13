import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';

export interface SplitBtnOption {
  value: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-split-button',
  imports: [],
  templateUrl: './split-button.component.html',
  styleUrl: './split-button.component.scss',
})
export class SplitButtonComponent implements OnInit {
  @Input() options: SplitBtnOption[] = [];
  @Input() disabled: boolean = false;

  @Output() actionExecuted = new EventEmitter<string>();

  isOpen = false;
  selectedOption!: SplitBtnOption;

  constructor(private eRef: ElementRef) {}

  ngOnInit() {
    if (this.options && this.options.length > 0) {
      this.selectedOption = this.options[0];
    }
  }

  toggleMenu(event: Event): void {
    if (this.disabled) return;
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  selectOption(option: SplitBtnOption): void {
    if (this.disabled) return;
    this.selectedOption = option;
    this.isOpen = false;
  }

  executeAction(): void {
    if (this.disabled) return;
    this.isOpen = false;
    this.actionExecuted.emit(this.selectedOption.value);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
