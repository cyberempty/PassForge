# PassForge

PassForge is a secure password generator that works entirely client-side in the browser. It generates passwords, PINs, and passphrases using cryptographically secure algorithms directly on your device.

## Features

- **Password Generation**: Creates random passwords with uppercase, lowercase, numbers, and symbols
- **PIN Generation**: Generates custom numeric PINs
- **Passphrase Generation**: Creates easy-to-remember passphrases composed of multiple words
- **Strength Indicator**: Shows the strength of the generated password
- **Cracking Time**: Estimates the time needed to crack the password in case of an offline attack
- **Dictionary Warning**: Warns if the password contains common words
- **Copy to Clipboard**: Easily copy the generated password with one click

## How It Works

PassForge generates passwords locally in your browser using the browser's `crypto.getRandomValues()` function, which provides cryptographically secure random numbers. No data is sent to servers or stored externally.

## How to Use

1. Open `index.html` in your browser
2. Choose the generation type (Password, PIN, or Passphrase)
3. Set the desired length or number of words
4. Select the character types to include (for passwords)
5. Click "Generate" to create the password
6. Click "Copy" to copy the password to the clipboard

## Security

- All generation happens locally in the browser
- No data is sent to servers
- No cookies or tracking
- Uses cryptographically secure algorithms for random generation

## Project Files

- `index.html` - Main generator page
- `how-to-create-secure-password.html` - Guide to creating secure passwords
- `legal/privacy.html` - Privacy policy
- `legal/terms.html` - Terms of service
- `script.js` - JavaScript logic for password generation
- `style.css` - CSS styles for the interface
