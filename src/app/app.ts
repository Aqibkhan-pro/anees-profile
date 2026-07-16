import { AfterViewInit, Component, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly title = signal('anees-profile');
  private cleanup: Array<() => void> = [];
  private revealObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.setupTheme();
    this.setupMobileNav();
    this.setupRevealAnimations();
  }

  ngOnDestroy(): void {
    this.cleanup.forEach((fn) => fn());
    this.revealObserver?.disconnect();
  }

  private setupTheme(): void {
    const root = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme) {
      root.setAttribute('data-theme', storedTheme);
    } else if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      root.setAttribute('data-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
    }

    if (!themeToggle) {
      return;
    }

    const onToggleTheme = () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    };

    themeToggle.addEventListener('click', onToggleTheme);
    this.cleanup.push(() => themeToggle.removeEventListener('click', onToggleTheme));
  }

  private setupMobileNav(): void {
    const mobileNav = document.getElementById('mnav');
    const openButton = document.getElementById('burger-open');
    const closeButton = document.getElementById('burger-close');

    if (!mobileNav || !openButton || !closeButton) {
      return;
    }

    const openNav = () => mobileNav.classList.add('open');
    const closeNav = () => mobileNav.classList.remove('open');

    openButton.addEventListener('click', openNav);
    closeButton.addEventListener('click', closeNav);
    this.cleanup.push(() => openButton.removeEventListener('click', openNav));
    this.cleanup.push(() => closeButton.removeEventListener('click', closeNav));

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
      this.cleanup.push(() => link.removeEventListener('click', closeNav));
    });
  }

  private setupRevealAnimations(): void {
    const elements = document.querySelectorAll('.reveal, .bar');

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('in'));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            this.revealObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    elements.forEach((element) => this.revealObserver?.observe(element));
  }
}
