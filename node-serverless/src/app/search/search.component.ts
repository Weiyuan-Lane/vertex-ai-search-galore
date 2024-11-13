import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MerchResult, Message, PhoneResult } from '../../types/message';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  isInitial: boolean = true;
  resultCount: number = 0;
  secondsTaken: number = 0;
  results: Array<Message> = [];
  searching: boolean = true;
  geminiResponse: string = '';

  public searchText: string = '';

  constructor(private http: HttpClient) {
  }

  public search() {
    // Reset states
    this.searching = true;
    this.resultCount = 0;
    this.secondsTaken = 0;
    this.results = [];
    this.geminiResponse = '';

    // Always set this, escape back to home screen
    if (this.searchText === '') {
      this.isInitial = true;
      return;
    }

    this.isInitial = false;
    const startTime = Date.now();

    // Simulate search operation
    return this.http.post<{message: string, results: Array<any>}>('/search', {
      message: this.searchText,
    })
    .subscribe((data) => {
      if (data.results && data.results.length > 0) {
        data.results.forEach((result) => {
          if (result.type?.stringValue === 'phone') {
            this.results.push({
              content: result as PhoneResult,
              timestamp: new Date(),
              state: 'gemini-result-phone',
            });
          } else {
            this.results.push({
              content: result as MerchResult,
              timestamp: new Date(),
              state: 'gemini-result-merch',
            });
          }
        });
      } else {
        this.geminiResponse = data.message;
      }

      const endTime = Date.now();
      this.secondsTaken = (endTime - startTime) / 1000;
      this.resultCount = this.results.length;
      this.searching = false;
    });
  }

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
