# Angular service for Yandex Metric

## Usage:

* Example 1:
```
export class AppComponent
    public constructor(
      private yandexMetricService: YandexMetricService,
    ) {
      this.yandexMetricService.initialize(123456789);
    };
}
```

Where 123456789 is Yandex Id

* Example 2:
```
export class AppComponent
    public constructor(
        private yandexMetricService: YandexMetricService,
    ) {
        this.yandexMetricService.initialize(
            123456789,
            {
                defer: true,
                clickmap: false,
                trackLinks: false,
                accurateTrackBounce: true,
            },
        );
    };
}
```

Second argument is object of Yandex Metric options: https://yandex.ru/support/metrica/code/counter-initialize.html?lang=en

* Example 3:
```
export class AppComponent
    public constructor(
        private yandexMetricService: YandexMetricService,
    ) {
        this.yandexMetricService.initialize(
            123456789,
            {
                defer: true,
                clickmap: false,
                trackLinks: false,
                accurateTrackBounce: true,
            },
            {
                skipLocalhost: false,
                testUrlCallback: (url: string) => !url.startsWith('/admin'),
            },
        );
    };
}
```

Third argument is service options.

skipLocalhost: false - do not skip metric in case of development mode.

testUrlCallback - skip metric if url starts with '/admin'. For example in case of admin resources.

Full Description is below.

## Arguments:

| #  | title | object key      | type                  | required/optional | default value | description                                                            
|----|------|-----------------|-----------------------|------------------|---------------|------------------------------------------------------------------------
| 1  |    Yandex Id          |                 | number                |required         | N/A           | Yandex Metric unique Id                                                |
| 2  |   Yandex options      |                 | object                |optional         | empty object  | https://yandex.ru/support/metrica/code/counter-initialize.html?lang=en |
| 3  |  Service options      |                 | object                |optional         |               |                                                                        |
||| enabled$        | Observable\<boolean\> |optional|of(true)| Observable of boolean value. If value is true, then metric will be send   |
||| skipLocalhost   | boolean |optional|true| To skip calling metric on localhost                                    |
||| testUrlCallback | (url: string) => boolean |optional|() => true| Callback function. If it returns true, then metric will be send        |
