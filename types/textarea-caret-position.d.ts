declare module 'textarea-caret-position' {
  interface Options {
    debug?: boolean;
  }

  function getCaretCoordinates(
    element: HTMLElement,
    position: number,
    options?: Options
  ): { top: number; left: number };

  export = getCaretCoordinates;
} 