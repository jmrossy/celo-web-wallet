import { useState } from 'react'
import { Button } from 'src/components/buttons/Button'
import EyeIcon from 'src/components/icons/eye.svg'
import PasteIcon from 'src/components/icons/paste.svg'
import { HelpText } from 'src/components/input/HelpText'
import { sharedInputStyles } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'
import { isValidMnemonic } from 'src/features/wallet/utils'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { isClipboardReadSupported, tryClipboardGet } from 'src/utils/clipboard'

interface Props {
  value: string
  error?: boolean
  helpText?: string
  margin?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const WORD_INDEXES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
]
const PLACEHOLDERS = ['fish', 'boot', 'jump']

enum ShowWordState {
  None,
  Half1, // First half of words
  Half2, // Second half of words
}

export function MnemonicInput(props: Props) {
  const { value, helpText, margin, onChange } = props
  const words = value.split(' ').slice(0, 24)

  // Merges the words together to pass up a single mnemonic string to parent onChange handler
  const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event?.target) return
    // Remove whitespace
    const newValue = event.target.value.replace(/\s+/g, '')
    const newWords = [...words]
    newWords[index] = newValue
    const mnemonic = newWords.join(' ')
    event.target.value = mnemonic
    event.target.name = 'mnemonic'
    onChange(event)
  }

  const onClickPaste = async () => {
    const value = await tryClipboardGet()
    if (!value || !isValidMnemonic(value)) return
    // @ts-ignore using fake event here
    onChange({ target: { value: value.trim(), name: 'mnemonic' } })
  }

  const [showWords, setShowWords] = useState<ShowWordState>(ShowWordState.None)
  const onClickShowWords = (action: ShowWordState) => {
    if (showWords === action) {
      setShowWords(ShowWordState.None)
    } else {
      setShowWords(action)
    }
  }

  return (
    <Box direction="column" margin={margin} align="center">
      <div css={style.containerGrid}>
        {WORD_INDEXES.map((i) => (
          <input
            key={`mnemonic-word-${i}`}
            name={`mnemonic-word-${i}`}
            type={getInputType(i, showWords)}
            css={style.wordInput}
            value={words[i] || ''}
            placeholder={PLACEHOLDERS[i] || `${i + 1}.`}
            onChange={(event) => handleChange(i, event)}
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
        ))}
      </div>
      <Box align="center" justify="center" margin="1.5em 0.5em 0 0.5em">
        {isClipboardReadSupported() && (
          <Box align="center" margin="0 1.6em 0 0">
            <Button
              size="icon"
              type="button"
              onClick={onClickPaste}
              icon={PasteIcon}
              iconStyles={style.buttonIcon}
              title="Paste phrase"
            />
            <label css={style.buttonLabel}>Paste</label>
          </Box>
        )}
        <Box align="center" margin="0 1.6em 0 0">
          <Button
            size="icon"
            type="button"
            onClick={() => onClickShowWords(ShowWordState.Half1)}
            icon={EyeIcon}
            iconStyles={style.buttonIcon}
            title="Show half"
          />
          <label css={style.buttonLabel}>Show 1 - 12</label>
        </Box>
        <Box align="center">
          <Button
            size="icon"
            type="button"
            onClick={() => onClickShowWords(ShowWordState.Half2)}
            icon={EyeIcon}
            iconStyles={style.buttonIcon}
            title="Show half"
          />
          <label css={style.buttonLabel}>Show 12 - 24</label>
        </Box>
      </Box>
      {helpText && <HelpText margin="1em 0 -1em 0">{helpText}</HelpText>}
    </Box>
  )
}

function getInputType(index: number, showWords: ShowWordState): 'password' | 'text' {
  if (index < 12 && showWords === ShowWordState.Half1) return 'text'
  if (index >= 12 && showWords === ShowWordState.Half2) return 'text'
  return 'password'
}

const style: Stylesheet = {
  containerGrid: {
    display: 'grid',
    width: 'calc(min(27em, 90vw))',
    gridTemplateColumns: 'repeat(auto-fit, minmax(4em, 1fr))',
    gridGap: '0.5em 0.5em',
  },
  wordInput: {
    ...sharedInputStyles,
    borderRadius: 3,
    padding: 6,
    maxWidth: '4em',
  },
  buttonLabel: {
    ...Font.body2,
    marginLeft: '0.4em',
  },
  buttonIcon: {
    height: '1.25em',
    width: '1.25em',
  },
}
