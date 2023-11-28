# ganxing

## Languages

- [English](README.md)
- [中文](README.zh.md)

Welcome to ganxing, a comprehensive collection of personal programming utilities and components by Gan-Xing. This project is designed to be a versatile toolkit for various development needs, encompassing testing, linting, formatting, and documentation generation.

## Getting Started

1.**Clone the repository**

```bash
git clone <https://github.com/Gan-Xing/ganxing.git>
cd ganxing
```

2.**Install the dependencies**

Make sure you have Node.js (v18.0.0 or newer) and npm (v8.0.0 or newer) installed. This project recommends using pnpm for managing dependencies, although npm or yarn would work just fine.

```bash
pnpm install
```

## Scripts

Here are some scripts provided to help you manage the project:

- **Testing:** Run tests using Jest.

```bash
pnpm run test
```

- **Linting:** Check your code for stylistic and programming errors with ESLint.

```bash
pnpm run lint
```

- **Formatting:** Format your code with Prettier.

```bash
pnpm run format
```

- **Check Formatting:** Check if your code is well formatted.

```bash
pnpm run check-format
```

- **Cleaning:** Delete the \`dist\` directory to clean old build outputs.

```bash
pnpm run clean
```

- **Documentation:** Generate documentation for your code with TypeDoc.

```bash
pnpm run docs
```

- **Building:** Build your project with Vite.

```bash
pnpm run build
```

- **Committing Changes:** We use Commitizen for formatted commit messages.

```bash
pnpm run commit
```

This command will prompt you for details about the commit which will then be formatted according to conventional commit standards.

## Committing Guidelines

We follow the Conventional Commits guidelines for commit messages. When you're ready to commit your changes, run \`pnpm run commit\` and follow the prompts to generate a formatted commit message.

## Documentation

The generated documentation will be placed in the \`./docs\` directory, which you can browse locally or host it on a web server.

## Issues and Feedback

For bugs reporting, feature requests or any other feedback, please visit [GitHub Issues](https://github.com/Gan-Xing/ganxing/issues).

## License

This project is licensed under the ISC license. For more information, see the [LICENSE](LICENSE) file in the repository.

---

Thank you for checking out ganxing. Happy coding!
