import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';

describe('AppComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ]
    }).compileComponents();
  }));

  it('should render a value stored and retrieved from local storage', (done: DoneFn) => {

    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    window.setTimeout(() => {

      fixture.detectChanges();

      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('h1').textContent).toBe(fixture.componentInstance.title);

      done();

    }, 2000);

  });

});
