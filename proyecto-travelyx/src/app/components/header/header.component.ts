import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { PollyService } from '../../services/polly.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HeaderComponent {
  lang: 'es' | 'en' = 'es';

  constructor(
    public langService: LanguageService,
    private polly: PollyService
  ) {
    this.langService.currentLang$.subscribe(l => this.lang = l);
  }

  setLang(l: 'es' | 'en') {
    if (this.lang !== l) {
      this.langService.setLanguage(l);
      this.polly.speak(this.langService.translate('langChanged'), 'HAPPY');
    }
  }
}
