// Angular service for Yandex Metric
// https://github.com/rogit/yandex-metric-angular-service
// version 2025.1.1

import { NavigationEnd, Router } from '@angular/router';
import { combineLatest, filter, isObservable, map, Observable, of, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

declare global {
  interface Window {
    ym: (id: number, action: string, url: string) => void;
  }
}

interface YandexOptions {
  [key: string]: unknown;
}

@Injectable(
  {providedIn: 'root'},
)
export class YandexMetricService {
  private loaded: boolean = false;
  private loading: boolean = false;
  private loaded$$: Subject<void> = new Subject();

  public constructor(
    private router: Router,
  ) {
  }

  public initialize(
    yandexId: number,
    // https://yandex.ru/support/metrica/code/counter-initialize.html?lang=en
    yandexOptions: YandexOptions = {},
    options?: {
      enabled$?: Observable<boolean>,
      skipLocalhost?: boolean,
      testUrlCallback?: (url: string) => boolean,
    },
  ): void {
    const skipLocalhost: boolean = options?.skipLocalhost ?? true;
    if (skipLocalhost && window.location.hostname === 'localhost') {
      return;
    }

    const enabled$: Observable<boolean> = isObservable(options?.enabled$) ? options.enabled$ : of(true);
    const testUrlCallback: (url: string) => boolean = typeof options?.testUrlCallback === 'function' ?
      options?.testUrlCallback : () => true;

    combineLatest([
      enabled$,
      this.router.events.pipe(filter((event: unknown) => event instanceof NavigationEnd)),
    ]).pipe(
      filter(([enabled]: [boolean, NavigationEnd]) => enabled),
      map(([, event]: [boolean, NavigationEnd]) => event.url),
    ).subscribe((url: string) => {
      if (!testUrlCallback(url)) {
        return;
      }
      if (this.loaded) {
        window.ym(yandexId, 'hit', url);
      } else {
        if (!this.loading) {
          this.loading = true;
          this.loadYandexScript(yandexId, yandexOptions);
        }
        this.loaded$$.subscribe(() => {
          window.ym(yandexId, 'hit', url);
        });
      }
    });
  }

  private loadYandexScript(yandexId: number, yandexOptions: YandexOptions): void {
    const options: string = JSON.stringify({
      ...yandexOptions,
      triggerEvent: true,
    });
    document.addEventListener(`yacounter${yandexId}inited`, () => {
      this.loaded$$.next();
      this.loaded = true;
      this.loading = false;
    });
    const scriptElement: HTMLScriptElement = document.createElement('script');
    scriptElement.innerHTML = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(${yandexId}, "init", ${options});`;
    const head: HTMLHeadElement = document.head;
    head.appendChild(scriptElement);
  }
}
