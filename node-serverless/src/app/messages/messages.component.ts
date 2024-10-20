import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MerchResult, Message, PhoneResult } from '../../types/message';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {
  @Input('messages') messages: Message[] = [];

  getMerchContent(message: Message): MerchResult {
    return message.content as MerchResult;
  }

  getPhoneContent(message: Message): PhoneResult {
    return message.content as PhoneResult;
  }

  getHourVal(date: Date): string {
    return `0${date.getHours()}`.slice(-2);
  }

  getMinuteVal(date: Date): string {
    return `0${date.getMinutes()}`.slice(-2);
  }
}
