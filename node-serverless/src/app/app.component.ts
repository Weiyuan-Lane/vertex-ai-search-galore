import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpClientModule } from  '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MessageInputComponent } from './message-input/message-input.component';
import { MessagesComponent } from './messages/messages.component';
import { Message, PhoneResult, MerchResult } from '../types/message';
import { Router, NavigationEnd } from '@angular/router';

let SpeechSynthesisApi: SpeechSynthesis;

if (typeof window !== "undefined") {
  SpeechSynthesisApi = window.speechSynthesis;
}

type SpeechSynthesisUtteranceProps = {
  text: string,
  language: string,
  voice: string,
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    MatProgressSpinnerModule,
    CommonModule,
    MessagesComponent,
    MessageInputComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'search-with-gemini';
  isRoot: boolean = false;

  @ViewChild('scroll', { read: ElementRef })
  public scroll!: ElementRef<any>;

  public messages: Message[] = [];
  public loaderStatus: boolean = false;

  constructor(private http: HttpClient, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isRoot = this.router.url === '/';
      }
    });
  }

  public scrollBottom() {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }

  public sendMessage(message: Message) {
    const { content, triggerSearch } = message;
    this.pushMessage(message);
    setTimeout(() => {
      this.scrollBottom();
    });

    // Only propagate message to the server if the message is from the user
    if (triggerSearch) {
      this.loaderStatus = true;
      return this.http.post<{message: string, results: Array<any>}>('/search', {
        message: content,
      })
      .subscribe((data) => {
        this.loaderStatus = false;
        this.pushMessage({
          content: data.message,
          timestamp: new Date(),
          state: 'gemini',
          audioSynthesis: message.delayAudioSynthesis,
        });
        if (data.results && data.results.length > 0) {
          data.results.forEach((result) => {
            if (result.type?.stringValue === 'phone') {
              this.pushMessage({
                content: result as PhoneResult,
                timestamp: new Date(),
                state: 'gemini-result-phone',
              });
            } else {
              this.pushMessage({
                content: result as MerchResult,
                timestamp: new Date(),
                state: 'gemini-result-merch',
              });
            }
          });
        }

        setTimeout(() => {
          this.scrollBottom();
        });
      });
    }

    return null;
  }

  pushMessage(message: Message): void {
    this.messages.push(message);

    // Speak only when triggered
    if (message.audioSynthesis) {
      this.speechSynthesis({
        text: message.content as string,
        language: message?.audio?.language || 'en-GB',
        voice: message?.audio?.voice || 'Daniel (English (United Kingdom))',
      });
    }
  }

  getSpeechSynthesisUtterance({
    text,
    language,
    voice,
  }: SpeechSynthesisUtteranceProps): SpeechSynthesisUtterance {
    const speechDiv = document.createElement('div');
    speechDiv.innerHTML = text;
    const utterance = new SpeechSynthesisUtterance(speechDiv.innerText);

    const voices = SpeechSynthesisApi.getVoices();
    const selectedVoice = voices.find((currentVoice) => {
      return currentVoice.lang === language && currentVoice.name === voice;
    });

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    return utterance;
  }

  speechSynthesis(props: SpeechSynthesisUtteranceProps) {
    const utterance = this.getSpeechSynthesisUtterance(props);
    SpeechSynthesisApi.speak(utterance);
  }
}
