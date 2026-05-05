# PromptCard Component

A reusable card component for displaying the daily prompt with different visual styles.

## Usage

```astro
import PromptCard from '../components/PromptCard.astro';

<PromptCard 
  prompt={promptText} 
  isMock={false} 
  variant="glow" 
/>
```

## Props

- `prompt` (string, required): The prompt text to display
- `isMock` (boolean, optional): Whether to show the dev mock badge. Default: `false`
- `variant` ('glow' | 'plus', optional): The card style variant. Default: `'glow'`

## Variants

### `glow`
Card with soft pink/blue glowing corners that pulse in a breathing animation.

### `plus`
Card with minimalist plus signs (+) in each corner that rotate and scale in a staggered animation.

## Switching Variants

To switch between card styles, simply change the `variant` prop in `src/pages/index.astro`:

```astro
<!-- Glow variant (default) -->
<PromptCard prompt={prompt} isMock={isMock} variant="glow" />

<!-- Plus variant -->
<PromptCard prompt={prompt} isMock={isMock} variant="plus" />
```

## Features

Both variants include:
- Typewriter animation (30ms per character)
- Centered text layout
- Brutalist typography
- Dark semi-transparent background with backdrop blur
- Responsive sizing
- Dev mock badge (when `isMock` is true)

