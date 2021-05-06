/**
 * This used to be a real type like CSSPropertiesWithMultiValues & CSSPseudos
 * But that after some tsc compilation debugging, I found that was causing
 * the compilation times to grow 2-3x, only worsening as the project grows.
 * Made development in VSCode pretty painful. So I'm sacrificing css type safety
 * in favor of fast intellisense for now :(
 * Related: https://github.com/emotion-js/emotion/issues/2257
 */
export type Styles = any

export type Stylesheet = Record<string, Styles>
