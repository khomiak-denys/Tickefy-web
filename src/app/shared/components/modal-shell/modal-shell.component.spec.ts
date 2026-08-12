import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ModalShellComponent } from './modal-shell.component';

@Component({
  template: `
    <app-modal-shell [open]="open" [title]="title" (closed)="onClose()">
      <p class="projected-body">Body content</p>
      <div modal-footer class="projected-footer">Footer content</div>
    </app-modal-shell>
  `,
  imports: [ModalShellComponent],
})
class HostComponent {
  open = false;
  title = 'Test Modal';
  closed = false;

  onClose(): void {
    this.closed = true;
  }
}

describe('ModalShellComponent', () => {
  let hostFixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostComponent);
    host = hostFixture.componentInstance;
    nativeEl = hostFixture.nativeElement;
    hostFixture.detectChanges();
  });

  it('should_NotRenderModal_When_OpenIsFalse', () => {
    host.open = false;
    hostFixture.detectChanges();

    expect(nativeEl.querySelector('.modal')).toBeNull();
    expect(nativeEl.querySelector('.modal-backdrop')).toBeNull();
  });

  it('should_RenderModal_When_OpenIsTrue', () => {
    host.open = true;
    hostFixture.detectChanges();

    expect(nativeEl.querySelector('.modal')).not.toBeNull();
    expect(nativeEl.querySelector('.modal-backdrop')).not.toBeNull();
  });

  it('should_DisplayTitle_When_TitleInputIsProvided', () => {
    host.open = true;
    host.title = 'My Modal Title';
    hostFixture.detectChanges();

    const h3 = nativeEl.querySelector<HTMLElement>('.modal-head h3');
    expect(h3?.textContent?.trim()).toBe('My Modal Title');
  });

  it('should_EmitClose_When_CloseButtonIsClicked', () => {
    host.open = true;
    hostFixture.detectChanges();

    const closeBtn = nativeEl.querySelector<HTMLButtonElement>('button.close');
    closeBtn?.click();
    hostFixture.detectChanges();

    expect(host.closed).toBe(true);
  });

  it('should_EmitClose_When_BackdropIsClicked', () => {
    host.open = true;
    hostFixture.detectChanges();

    const backdrop = nativeEl.querySelector<HTMLElement>('.modal-backdrop');
    backdrop?.click();
    hostFixture.detectChanges();

    expect(host.closed).toBe(true);
  });

  it('should_ProjectBodyContent_Into_ModalBody', () => {
    host.open = true;
    hostFixture.detectChanges();

    const body = nativeEl.querySelector('.modal-body');
    expect(body?.querySelector('.projected-body')?.textContent?.trim()).toBe('Body content');
  });

  it('should_ProjectFooterContent_Into_ModalFoot', () => {
    host.open = true;
    hostFixture.detectChanges();

    const footer = nativeEl.querySelector('.modal-foot');
    expect(footer?.querySelector('.projected-footer')?.textContent?.trim()).toBe('Footer content');
  });
});
