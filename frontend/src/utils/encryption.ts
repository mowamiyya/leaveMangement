// Simple encryption utility using Base64 encoding
// Note: For production, use proper encryption libraries like crypto-js

export const encryptPayload = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data)
    // Simple Base64 encoding (for production, use proper encryption)
    const encoded = btoa(jsonString)
    return encoded
  } catch (error) {
    console.error('Encryption error:', error)
    return JSON.stringify(data)
  }
}

export const decryptPayload = (encrypted: string): any => {
  try {
    // Simple Base64 decoding
    const decoded = atob(encrypted)
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

// For sensitive data like passwords, we'll use a simple obfuscation
// In production, use proper encryption with crypto-js or similar
export const obfuscatePassword = (password: string): string => {
  // Simple XOR obfuscation (not secure, just for demonstration)
  // In production, passwords should be hashed on the server side only
  return btoa(password)
}
