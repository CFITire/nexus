import * as crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const ITERATIONS = 100000

// Get encryption key from environment or generate a secure one
const ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY || generateSecureKey()

function generateSecureKey(): string {
  // In production, this should be stored securely (Azure Key Vault, etc.)
  const key = crypto.randomBytes(32).toString('hex')
  console.warn('⚠️  No VAULT_ENCRYPTION_KEY found. Generated temporary key:', key)
  console.warn('⚠️  Add VAULT_ENCRYPTION_KEY to your .env file for production!')
  return key
}

export interface EncryptedData {
  encrypted: string
  iv: string
  salt: string
  tag: string
}

export function encryptPassword(password: string): EncryptedData {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)
    
    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, ITERATIONS, 32, 'sha512')
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    // Encrypt the password
    let encrypted = cipher.update(password, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Get authentication tag
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      tag: tag.toString('hex')
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt password')
  }
}

export function decryptPassword(encryptedData: EncryptedData): string {
  try {
    const { encrypted, iv, salt, tag } = encryptedData
    
    // Convert hex strings back to buffers
    const ivBuffer = Buffer.from(iv, 'hex')
    const saltBuffer = Buffer.from(salt, 'hex')
    const tagBuffer = Buffer.from(tag, 'hex')
    
    // Derive the same key
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, saltBuffer, ITERATIONS, 32, 'sha512')
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer)
    decipher.setAuthTag(tagBuffer)
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt password')
  }
}

// Utility to convert encrypted data to/from database storage
export function encryptedDataToString(data: EncryptedData): string {
  return JSON.stringify(data)
}

export function encryptedDataFromString(str: string): EncryptedData {
  try {
    return JSON.parse(str)
  } catch (error) {
    throw new Error('Invalid encrypted data format')
  }
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isStrong: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // Length check
  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')
  
  if (password.length >= 12) score += 1
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Include lowercase letters')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Include uppercase letters')
  
  if (/[0-9]/.test(password)) score += 1
  else feedback.push('Include numbers')
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else feedback.push('Include special characters')
  
  // Common patterns
  if (!/(.)\1{2,}/.test(password)) score += 1
  else feedback.push('Avoid repeating characters')
  
  return {
    isStrong: score >= 5,
    score,
    feedback
  }
}