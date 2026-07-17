# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Merging Strategy 

Main 
  Feature-eportal 
    Raise merge request to Main
      Pull the latest code from main then create new feaure branch
  Release
    Create release tag and create release branch from given tag

  From this release branch -> deployed this on test env Rel-1.0.0 -> eportal implementions
  test below prod -> Rel-1.0.0-SNAPSHOT


  DEV -> SNAPSHOT
  TEST -> Rel-1.0.0 -> Rel-1.0.100 ->
  UAT -> Rel-1.0.0 -> Rel-1.0.100  -> Major-Milestore-Minor
  PROD -> Rel-1.0.0 -> Rel-1.1.0
  
