import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpClientModule } from  '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MessageInputComponent } from './message-input/message-input.component';
import { MessagesComponent } from './messages/messages.component';
import { Message } from '../types/message';


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
  title = 'chat-with-gemini';

  @ViewChild('scroll', { read: ElementRef })
  public scroll!: ElementRef<any>;

  public messages: Message[] = [];
  public loaderStatus: boolean = false;

  constructor(private http: HttpClient) {
  }

  public scrollBottom() {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }

  public sendMessage(messageText: string) {
    this.messages.push({
      content: messageText,
      timestamp: new Date(),
      self: true
    });
    setTimeout(() => {
      this.scrollBottom();
    });

    this.loaderStatus = true;
    return this.http.post<{message: string}>('/chat', {
      message: messageText
    })
    .subscribe((data) => {
      this.loaderStatus = false;
      this.messages.push({
        content: data.message,
        timestamp: new Date(),
        self: false
      });
      setTimeout(() => {
        this.scrollBottom();
      });
    });
  }
}
