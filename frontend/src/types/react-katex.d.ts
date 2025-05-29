declare module 'react-katex' {
  import React from 'react';
  
  interface KatexProps {
    math: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    settings?: {
      displayMode?: boolean;
      throwOnError?: boolean;
      errorColor?: string;
      macros?: any;
      colorIsTextColor?: boolean;
      strict?: boolean | string;
      trust?: boolean | ((context: any) => boolean);
      [key: string]: any;
    };
    children?: never;
  }
  export class InlineMath extends React.Component<KatexProps> {}
  export class BlockMath extends React.Component<KatexProps> {}
  
  const ReactKatex = {
    InlineMath,
    BlockMath
  };
  
  export default ReactKatex;
}
