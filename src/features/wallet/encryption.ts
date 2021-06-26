import { logger } from 'src/utils/logger'

const SALT = '68d0ad14364deb3d417cd644e84dd1f5659d70287f2d2c94be5ce6eaf21a014f' // Sha256 of 'CeloWebWallet'
const IV_LENGTH = 12 // Size of initialization vector for encryption
const NUM_DERIVATION_ITERATIONS = 250000

export async function tryEncryptMnemonic(mnemonic: string, password: string) {
  try {
    const ciphertext = await encryptMnemonic(mnemonic, password)
    return ciphertext
  } catch (error) {
    // Excluding error message in case it contains senstive data
    logger.error('Error encrypting mnemonic')
    throw new Error('Cannot encrypt account key')
  }
}

export async function encryptMnemonic(mnemonic: string, password: string) {
  if (!mnemonic || !password) throw new Error('Invalid arguments for encryption')
  if (!crypto || !crypto.subtle) throw new Error('Crypto libs not available')

  const keyMaterial = await getKeyMaterialFromPassword(password)
  const encryptionKey = await deriveKeyFromKeyMaterial(keyMaterial)
  return encrypt(encryptionKey, mnemonic)
}

export async function tryDecryptMnemonic(ciphertext: string, password: string) {
  try {
    const mnemonic = await decryptMnemonic(ciphertext, password)
    return mnemonic
  } catch (error) {
    // Excluding error message in case it contains senstive data
    logger.error('Error decrypting mnemonic')
    throw new Error('Cannot decrypt account key')
  }
}

export async function decryptMnemonic(ciphertext: string, password: string) {
  if (!ciphertext || !password) {
    throw new Error('Invalid arguments for decryption')
  }

  const keyMaterial = await getKeyMaterialFromPassword(password)
  const encryptionKey = await deriveKeyFromKeyMaterial(keyMaterial)
  return decrypt(encryptionKey, ciphertext)
}

function encodeText(data: string) {
  const enc = new TextEncoder()
  return enc.encode(data)
}

function decodeText(data: ArrayBuffer) {
  const dec = new TextDecoder()
  return dec.decode(data)
}

function getKeyMaterialFromPassword(password: string) {
  return crypto.subtle.importKey('raw', encodeText(password), 'PBKDF2', false, [
    'deriveBits',
    'deriveKey',
  ])
}

function deriveKeyFromKeyMaterial(keyMaterial: CryptoKey) {
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encodeText(SALT),
      iterations: NUM_DERIVATION_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

async function encrypt(encryptionKey: CryptoKey, data: string) {
  // Create a random initialization vector
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encryptedBuf = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    encryptionKey,
    encodeText(data)
  )
  const encryptedByteArr = new Uint8Array(encryptedBuf)

  // Now prepend IV to encrypted data
  const resultByteArr = new Uint8Array(iv.byteLength + encryptedByteArr.byteLength)
  resultByteArr.set(iv, 0)
  resultByteArr.set(encryptedByteArr, iv.byteLength)
  return byteArrToBase64(resultByteArr)
}

async function decrypt(encryptionKey: CryptoKey, base64Data: string) {
  // Create a random initialization vector
  const dataByteArr = base64ToByteArr(base64Data)
  const iv = dataByteArr.slice(0, IV_LENGTH)
  const encryptedArr = dataByteArr.slice(IV_LENGTH)
  const decryptedDataBuf = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    encryptionKey,
    encryptedArr
  )

  return decodeText(decryptedDataBuf)
}

function byteArrToBase64(buffer: Uint8Array) {
  const binary = String.fromCharCode(...buffer)
  return btoa(binary)
}

function base64ToByteArr(base64: string) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}
