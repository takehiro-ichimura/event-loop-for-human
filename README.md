# EventLoop4Human

**Manage your tasks like JavaScript manages code execution**

EventLoop4Human is an innovative task management web application that applies the JavaScript event loop mechanism to human task management. Experience the concepts of "single-threaded execution," "microtask priority," and "async waiting" while managing your tasks efficiently.

## Live Demo

**Try it now: [https://event-loop-for-human.web.app](https://event-loop-for-human.web.app)**

No installation required. No sign-up needed. Just open and start managing your tasks the JavaScript way.

## Concept

Your brain isn't good at "multitasking." In reality, it just rapidly switches between tasks. This behavior is remarkably similar to JavaScript's event loop.

EventLoop4Human embraces this similarity and manages tasks across four distinct areas:

- **Call Stack**: The task you're currently executing (always just one)
- **Microtask Queue**: Derived tasks related to the current task (high priority)
- **Task Queue**: Independent new tasks (lower priority)
- **Web API**: Blocked tasks waiting for external responses

## Why EventLoop4Human?

### For Developers
Learn the JavaScript event loop through real-world task management. Understand why promises execute before setTimeout, and experience the single-threaded nature of JavaScript in a tangible way.

### For Everyone
Stop context-switching chaos. Focus on one task at a time while intelligently managing priorities. The event loop model naturally handles the reality that you can only do one thing at once.

## Key Features

### Event Loop Behavior

- **Single-Task Execution**: Focus on one task at a time in the Call Stack
- **Automatic Priority Management**: Microtask Queue tasks are processed first
- **Blocking Visualization**: Manage waiting tasks in the Web API area

### Practical Task Management

- **Flexible Task Attributes**: Set name, estimated time, category, and notes
- **Intuitive Reordering**: Drag and drop tasks within queues
- **Data Persistence**: Auto-save state to LocalStorage

### Simple & Beautiful UI

- Monochrome minimal design
- Four areas clearly distinguished at a glance
- Responsive design for mobile and desktop

## How to Use

### Basic Workflow

1. **Add Tasks**: Add tasks to Task Queue or Microtask Queue
2. **Auto-Execution**: When Call Stack is empty, the next task is automatically loaded
3. **Focus & Complete**: Complete the task in Call Stack
4. **Block if Needed**: Move tasks waiting on others to Web API area

### Leverage Microtask Queue

Add derived tasks related to your current task to the Microtask Queue. For example:

- "Prepare attachments" while writing an email
- "Share agenda" while preparing for a meeting
- "Related refactoring" discovered while coding

These will be processed with priority over Task Queue tasks.

### Leverage Web API

When tasks get blocked by external dependencies (waiting for someone's response, approval, delivery, etc.), move them to the Web API area. When conditions are met, move them back to a queue to resume.

## Share Your Experience

Built something cool with EventLoop4Human? We'd love to hear about it!

- Tweet about it with **#EventLoop4Human**
- Share your workflow and task management strategies
- Show how the event loop model helps you stay focused

## Development

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Setup

```bash
# Clone the repository
git clone https://github.com/takehiro-ichimura/event-loop-for-human.git
cd event-loop-for-human

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the application.

### Scripts

```bash
# Start development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Type checking
npm run type-check
```

### Tech Stack

- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Drag & Drop**: @dnd-kit
- **Hosting**: Firebase Hosting

## Project Structure

```
event-loop-for-human/
├── src/
│   ├── components/       # React components
│   │   ├── areas/       # Four area components
│   │   ├── layout/      # Layout and error boundary
│   │   └── task/        # Task-related components
│   ├── hooks/           # Custom hooks
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── styles/          # Theme and style definitions
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── tests/               # Test files
├── specs/               # Specifications
└── dist/                # Build artifacts
```

## Design Principles

- **Terminal Aesthetic**: Dark terminal theme with green text on black background, inspired by retro computing
- **Functional Color Coding**: Each of the four areas has a distinct accent color (magenta, cyan, green, orange) for easy visual distinction
- **Minimal & Focused**: Clean interface that eliminates visual noise to help you focus on tasks
- **Monospace Typography**: Using developer-friendly fonts like Fira Code and JetBrains Mono
- **Responsive**: Optimized from desktop to mobile

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Learn More About Event Loop

- [JavaScript Event Loop Explained](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop)
- [Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
- [What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ) - Philip Roberts

---

**Your brain is single-threaded too.**
