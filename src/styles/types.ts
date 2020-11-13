import { CSSPropertiesWithMultiValues, CSSPseudos } from '@emotion/serialize'

export type Styles = CSSPropertiesWithMultiValues & CSSPseudos

export type Stylesheet = Record<string, Styles>
