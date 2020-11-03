import { CSSObject } from '@emotion/core';
import { PropsWithChildren, useMemo } from 'react';
import { Color } from 'src/styles/Color';
import { InputStyles } from 'src/styles/inputs';

export interface RadioBoxInputClasses {
  container?: CSSObject
  input?: CSSObject
  label?: CSSObject
}

export interface RadioBoxInputProps {
  name: string
  label: string
  value: string
  checked?: boolean
  classes?: RadioBoxInputClasses
  tabIndex?: number
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  // TODO add validation hook
}

const containerStyle: CSSObject = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: InputStyles.padding,
  border: InputStyles.border,
  borderColor: Color.primaryGrey,
  borderRadius: InputStyles.borderRadius,
  cursor: "pointer",
  userSelect: "none",
  color: Color.primaryGrey,
  marginRight: 4,
  height: InputStyles.defaultHeight,   //default height (may be overridden by the classes)  
};

const containerStyleSelected: CSSObject = {
  ...containerStyle,
  borderColor: Color.primaryGreen,
  color: Color.primaryGreen, //Color.primaryWhite,
  // backgroundColor: Color.primaryGreen,
};

const inputStyle: CSSObject = {
  position: "absolute",
  opacity: 0,
  cursor: "pointer",
};

const labelStyle: CSSObject = {
    color: "inherit",
  }

export function RadioBox(props: PropsWithChildren<RadioBoxInputProps>) {
  const { name, label, value, checked, classes, onChange, tabIndex } = props
  
  const containerCss = useMemo(() => { 
    let css = checked ? containerStyleSelected : containerStyle;
    if(classes?.container) css = {...css, ...classes.container};
    return css;
  }, [checked, classes?.container]);

  const inputCss = useMemo(() => {
    return {...inputStyle, ...classes?.input };
  }, [classes?.input]);

  const labelCss = useMemo(() => {
    return {...labelStyle, ...classes?.label };
  }, [classes?.label]);

  return (
    <label css={containerCss} tabIndex={tabIndex}>
      <input name={name} type="radio" value={value} css={inputCss} checked={checked} onChange={onChange}/>
      <span css={labelCss}>{label}</span>
    </label>
  )
}