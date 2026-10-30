// .ink files are compiled to ink JSON at build time (see vite.config.ts).
declare module '*.ink' {
  const json: string
  export default json
}
