# Leave Planner

A modern web application to help you plan and optimize your leave days. Maximize your time off by intelligently planning your leaves around holidays and weekends.

## Features

- 📅 Interactive calendar view
- 🎯 Smart leave suggestions
- 📊 Leave balance tracking
- 🌍 Country-specific holiday support
- 📱 Responsive design
- 🎨 Modern, accessible UI
- 💾 Import/Export functionality

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Headless UI
- Zustand (State Management)
- Date-fns

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/leave-planner.git
   cd leave-planner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
complete-leave-planner-ui/
├── public/                   # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # General purpose components
│   │   ├── calendar/       # Calendar specific components
│   │   ├── layout/         # Layout components
│   │   └── guided-setup/   # Guided setup components
│   ├── features/           # Feature-specific components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── store/              # State management
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
└── ...config files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Inter](https://rsms.me/inter/) - The font used in this project
- [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Headless UI](https://headlessui.dev/) - Unstyled, accessible UI components
