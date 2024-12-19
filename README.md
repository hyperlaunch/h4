# h4

h4 (short for Hyper, but can also mean Happy) is a batteries-included TypeScript framework built specifically for the Bun runtime. Taking inspiration from productive frameworks like Rails, Django, and Laravel, h4 provides a comprehensive suite of tools for building modern, "serverful" web applications with the DX of Typescript.

## Philosophy

h4 is built for developers who are tired of JavaScript ecosystem churn. We believe in creating a framework that isn't subject to multiple third-party roadmaps - one that's stable and consistent, with as few external dependencies as possible. When we do add third-party dependencies, it's because they add considerable value and have proven to be stable and consistent over time.

Currently, we only advocate for two external tools:
- **dbmate** for database migrations (installed by default with create-h4-app)
- **biome** for formatting and linting (installed by default with create-h4-app)

## Why h4?

- **Bun Maximalist**: Built from the ground up to make the best of Bun's exceptional performance and TypeScript capabilities
- **Developer Experience**: Streamlined workflows and intuitive patterns that make development a joy
- **Batteries Included**: Everything you need to build production-ready applications, right out of the box
- **Type Safety**: First-class TypeScript support throughout the entire framework

## Quick Start

```bash
bun x create-h4-app ./my-app
```

That's it! Follow the interactive prompts to scaffold your new h4 application.

## Core Packages

h4 is organized as a monorepo containing several packages:

### server
A high-performance HTTP server featuring:
- File system-based routing
- Controller pattern for organized request handling
- Built-in middleware support

### models
A modern ORM/query builder that combines the best of ActiveRecord conventions with a "repository" pattern:
- Built on top of bun:sqlite for exceptional performance
- Intuitive query interface
- Type-safe database operations
- Migration system

### queue
A job queue and worker using Bun's `Worker`:
- Asynchronous job processing
- Job retry policies
- Progress tracking
- Priority queues

### scheduler
A job scheduler similar to cron:
- `Worker` based execution
- Recurring job support
- Simple cron syntax for scheduling
- 
### frontend
A fast bundler and using `Bun.build`:
- Cache-busting filenames for efficient caching
- Transpiles TypeScript, JavaScript, and CSS
- Integrated live reload for development

### views
A lightweight templating system:
- Component-based design using JSX
- Server-side rendering with streaming support
- Type-safe props for predictable templates

### Supporting Utilities
- Logging
- Configuration management
- Common helpers

## Contributing

TBA