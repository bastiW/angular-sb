import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button type="button" class="awesome-button">
      @if (iconEmoji()) {
        <span class="icon">{{ iconEmoji() }}</span>
      }
      <span class="text">{{ awesomeAwesomeAwesomeText() }}</span>
    </button>
  `,
  styles: `
    .awesome-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: white;
      background: linear-gradient(135deg, #6e8efb, #a777e3);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .awesome-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      filter: brightness(1.1);
    }

    .awesome-button:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .icon {
      font-size: 1.25rem;
    }

    .text {
      line-height: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly awesomeIcon = input<'heart' | 'fire'>();
  readonly fire = input<boolean>(false);
  readonly awesomeAwesomeAwesomeText = input<string>('');

  readonly iconEmoji = computed(() => {
    if (this.awesomeIcon() === 'heart') {
      return '❤️';
    }
    if (this.fire()) {
      return '🔥';
    }
    return '';
  });
}
