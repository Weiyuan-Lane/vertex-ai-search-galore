import { ChangeDetectorRef, Component, EventEmitter, NgZone, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message } from '../../types/message';

let SpeechRecognitionApi: {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
};

if (typeof window !== "undefined") {
  SpeechRecognitionApi = (window.SpeechRecognition || window.webkitSpeechRecognition);
}

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
  @Output() sendMessageEvent = new EventEmitter<Message>();

  constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) {}

  public messageText: string = '';

  onKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitMessage();
    }
  }

  submitMessage(): void {
    if (!this.messageText || this.messageText === '') {
      return;
    }

    this.sendMessageEvent.emit({
      content: this.messageText,
      timestamp: new Date(),
      state: 'me',
      triggerSearch: true,
    });
    this.messageText = '';
  }

  formatString(input: string): string {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
        return trimmed;
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  submitAudioOption(): void {
    const recognition = new SpeechRecognitionApi();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastIndex = event.results.length - 1;
      const { transcript: result } = event.results[lastIndex][0];
      const formattedResult = this.formatString(result);

      this.ngZone.run(() => {
        // Easter egg for handsome
        if (this.isHandsome(formattedResult)){
          this.sendMessageEvent.emit({
            content: formattedResult,
            timestamp: new Date(),
            state: 'me',
          });

          this.sendMessageEvent.emit({
            content: `Yes sir, you are very handsome. In fact, everyone here at this event is`,
            timestamp: new Date(),
            state: 'gemini',
            audioSynthesis: true,
          });

          // PH only
          this.sendMessageEvent.emit({
            content: `matikas`,
            timestamp: new Date(),
            state: 'gemini',
            audioSynthesis: true,
            audio: {
              language: 'id-ID',
              voice: 'Damayanti',
            }
          });

          // // ID only
          // this.sendMessageEvent.emit({
          //   content: `cakep`,
          //   timestamp: new Date(),
          //   state: 'gemini',
          //   audioSynthesis: true,
          //   audio: {
          //     language: 'id-ID',
          //     voice: 'Damayanti',
          //   }
          // });

          // Thai only
          // this.sendMessageEvent.emit({
          //   content: `หน้าตาดี`,
          //   timestamp: new Date(),
          //   state: 'gemini',
          //   audioSynthesis: true,
          //   audio: {
          //     language: 'th-TH',
          //     voice: 'Kanya',
          //   }
          // });

          // Vietnamese only
          // this.sendMessageEvent.emit({
          //   content: `đẹp trai`,
          //   timestamp: new Date(),
          //   state: 'gemini',
          //   audioSynthesis: true,
          //   audio: {
          //     language: 'vi-VN',
          //     voice: 'Linh',
          //   }
          // });

          return;
        }

        // Hello there
        if (this.isHello(formattedResult)){
          this.sendMessageEvent.emit({
            content: formattedResult,
            timestamp: new Date(),
            state: 'me',
          });

          this.sendMessageEvent.emit({
            content: `Yes sir, how can I help you?`,
            timestamp: new Date(),
            state: 'gemini',
            audioSynthesis: true,
          });

          return;
        }

        this.sendMessageEvent.emit({
          content: formattedResult,
          timestamp: new Date(),
          state: 'me',
          triggerSearch: true,
          delayAudioSynthesis: true,
        });

        this.sendMessageEvent.emit({
          content: `Yes sir, I will search for "${formattedResult}"`,
          timestamp: new Date(),
          state: 'gemini',
          audioSynthesis: true,
        });

        // Force Angular to perform a full rerender
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      });
    };

    recognition.start();
  }

  isHandsome(text: string): boolean {
    return text.toLowerCase().includes('handsome');
  }

  isHello(text: string): boolean {
    return text.replace(/\n\s*$/m, '').toLowerCase() === 'hello';
  }
}
