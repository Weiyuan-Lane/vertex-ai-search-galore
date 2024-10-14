import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {
  @Output() sendMessageEvent = new EventEmitter<string>();

  public messageText: string = '';

  onKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitMessage();
    }
  }

  submitMessage(): void {
    this.sendMessageEvent.emit(this.messageText);
    this.messageText = '';
  }
}
