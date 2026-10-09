const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*';

let currentMode = 'password';

// =======================================================
// TIME TO CRACK CALCULATOR - READABLE FORMAT
// =======================================================

function calculateKeyspace(password) {
    const length = password.length;
    if (length === 0) return 0;
    
    let hasLower = /[a-z]/.test(password);
    let hasUpper = /[A-Z]/.test(password);
    let hasNumber = /[0-9]/.test(password);
    let hasSymbol = /[^a-zA-Z0-9]/.test(password);
    
    let charSetSize = 0;
    if (hasLower) charSetSize += 26;
    if (hasUpper) charSetSize += 26;
    if (hasNumber) charSetSize += 10;
    if (hasSymbol) charSetSize += 32;
    
    if (charSetSize === 0) return 0;
    
    let keyspace = Math.pow(charSetSize, length);
    
    if (!isFinite(keyspace)) {
        const log10Keyspace = length * Math.log10(charSetSize);
        keyspace = Math.pow(10, log10Keyspace);
    }
    
    return keyspace;
}

function estimateCrackTime(keyspace, attemptsPerSecond) {
    if (keyspace === 0 || attemptsPerSecond === 0) return Infinity;
    return keyspace / attemptsPerSecond;
}

function formatTimeReadable(seconds) {
    if (!isFinite(seconds) || seconds === Infinity) return '> 10¹⁰⁰ years';
    if (seconds < 1) return '< 1 second';
    
    const units = [
        { name: 'year', seconds: 31536000, plural: 'years' },
        { name: 'month', seconds: 2592000, plural: 'months' },
        { name: 'day', seconds: 86400, plural: 'days' },
        { name: 'hour', seconds: 3600, plural: 'hours' },
        { name: 'minute', seconds: 60, plural: 'minutes' },
        { name: 'second', seconds: 1, plural: 'seconds' }
    ];
    
    if (seconds > 1e15) {
        const years = seconds / 31536000;
        if (years > 1e12) return '1 trillion years';
        if (years > 1e11) return '100 billion years';
        if (years > 1e10) return '10 billion years';
        if (years > 1e9) return '1 billion years';
        if (years > 1e8) return '100 million years';
        if (years > 1e7) return '10 million years';
        if (years > 1e6) return Math.round(years / 1e6) + ' million years';
        if (years > 1e4) return Math.round(years / 1e3) + ' thousand years';
        return Math.round(years) + ' years';
    }
    
    let remaining = seconds;
    let result = [];
    let unitCount = 0;
    
    for (let unit of units) {
        if (remaining >= unit.seconds) {
            const value = Math.floor(remaining / unit.seconds);
            const unitName = value === 1 ? unit.name : unit.plural;
            result.push(value + ' ' + unitName);
            remaining %= unit.seconds;
            unitCount++;
            if (unitCount >= 2) break;
        }
    }
    
    return result.join(' ') || '< 1 second';
}

function calculateCrackTime(password) {
    const keyspace = calculateKeyspace(password);
    
    if (keyspace === 0 || password.length === 0) {
        return {
            time: '—',
            keyspace: 0,
            entropy: 0
        };
    }
    
    const GPU_SPEED = 1000000000;
    const seconds = estimateCrackTime(keyspace, GPU_SPEED);
    const timeFormatted = formatTimeReadable(seconds);
    
    const charSetSize = Math.pow(keyspace, 1 / password.length);
    const entropy = password.length * Math.log2(charSetSize);
    
    return {
        time: timeFormatted,
        keyspace: keyspace,
        entropy: entropy,
        seconds: seconds
    };
}

function checkDictionary(password) {
    const commonPasswords = [
        '123456', 'password', '123456789', '12345', '12345678', 'qwerty',
        'abc123', 'password1', '1234', '111111', 'iloveyou', 'admin',
        'welcome', 'login', 'letmein', 'passw0rd', 'shadow', 'master',
        'sunshine', 'princess', 'dragon', 'baseball', 'football', 'monkey',
        '696969', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1q2w3e4r'
    ];
    
    const lower = password.toLowerCase();
    for (let common of commonPasswords) {
        if (lower === common || lower.includes(common)) {
            return true;
        }
    }
    
    if (/\d{4}/.test(password)) {
        const year = password.match(/\d{4}/)[0];
        if (year >= 1900 && year <= 2099) return true;
    }
    
    if (/^[a-zA-Z]+\d+$/.test(password) && password.length < 12) return true;
    if (/^[a-z]+\d+$/.test(password) && password.length < 10) return true;
    
    return false;
}

function getStrengthLevel(entropy) {
    if (entropy >= 80) return 'strong';
    if (entropy >= 60) return 'good';
    if (entropy >= 40) return 'fair';
    return 'weak';
}

function updateTimeIndicator(password, timeValueId, warningId) {
    const timeValue = document.getElementById(timeValueId);
    const warningEl = document.getElementById(warningId);
    
    if (!password || password.length === 0) {
        timeValue.textContent = '—';
        timeValue.className = 'time-value';
        if (warningEl) warningEl.classList.remove('show');
        return;
    }
    
    const result = calculateCrackTime(password);
    const level = getStrengthLevel(result.entropy);
    
    timeValue.textContent = result.time;
    timeValue.className = 'time-value ' + level;
    
    if (warningEl) {
        const isCommon = checkDictionary(password);
        if (isCommon) {
            warningEl.textContent = '⚠️ This password is in common dictionaries! Could be cracked instantly.';
            warningEl.className = 'dictionary-warning show danger';
        } else if (password.length < 8) {
            warningEl.textContent = '⚠️ Too short! Use at least 12 characters for better security.';
            warningEl.className = 'dictionary-warning show warning';
        } else if (result.entropy < 40) {
            warningEl.textContent = '⚠️ Weak password! Add more variety (uppercase, numbers, symbols).';
            warningEl.className = 'dictionary-warning show warning';
        } else {
            warningEl.classList.remove('show');
        }
    }
}

// =======================================================
// END TIME TO CRACK CALCULATOR
// =======================================================

function calculateStrength(password) {
    let score = 0;
    
    if (password.length >= 16) {
        score += 40;
    } else if (password.length >= 12) {
        score += 30;
    } else if (password.length >= 8) {
        score += 20;
    } else if (password.length >= 1) {
        score += 10;
    }
    
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    
    score = Math.min(score, 100);
    return score;
}

function updateStrengthIndicator(password) {
    const score = calculateStrength(password);
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    const percentage = score;
    strengthBar.style.width = percentage + '%';
    
    let color, text;
    if (score < 40) {
        color = '#ff4444';
        text = 'Weak';
    } else if (score < 60) {
        color = '#ffaa00';
        text = 'Fair';
    } else if (score < 80) {
        color = '#ffcc00';
        text = 'Good';
    } else {
        color = '#44ff44';
        text = 'Very Strong';
    }
    
    strengthBar.style.background = color;
    strengthText.textContent = `${text} (${score}/100)`;
    strengthText.style.color = color;
    
    updateTimeIndicator(password, 'timeValue', 'dictionaryWarning');
}

function updatePinStrengthIndicator(pin) {
    const score = calculateStrength(pin);
    const strengthBar = document.getElementById('pinStrengthBar');
    const strengthText = document.getElementById('pinStrengthText');
    
    const percentage = score;
    strengthBar.style.width = percentage + '%';
    
    let color, text;
    if (score < 40) {
        color = '#ff4444';
        text = 'Weak';
    } else if (score < 60) {
        color = '#ffaa00';
        text = 'Fair';
    } else if (score < 80) {
        color = '#ffcc00';
        text = 'Good';
    } else {
        color = '#44ff44';
        text = 'Very Strong';
    }
    
    strengthBar.style.background = color;
    strengthText.textContent = `${text} (${score}/100)`;
    strengthText.style.color = color;
    
    updateTimeIndicator(pin, 'pinTimeValue', null);
}

function generatePassword() {
    let length = parseInt(document.getElementById('passwordLength').value);
    
    if (isNaN(length) || length < 1) {
        length = 16;
        document.getElementById('passwordLength').value = 16;
    }
    
    let useUppercase = document.getElementById('uppercase').checked;
    let useLowercase = document.getElementById('lowercase').checked;
    let useNumbers = document.getElementById('numbers').checked;
    let useSymbols = document.getElementById('symbols').checked;

    if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
        useUppercase = true;
        useLowercase = true;
        useNumbers = true;
        useSymbols = true;
        document.getElementById('uppercase').checked = true;
        document.getElementById('lowercase').checked = true;
        document.getElementById('numbers').checked = true;
        document.getElementById('symbols').checked = true;
    }

    let chars = '';
    if (useUppercase) chars += uppercaseChars;
    if (useLowercase) chars += lowercaseChars;
    if (useNumbers) chars += numberChars;
    if (useSymbols) chars += symbolChars;

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    document.getElementById('passwordOutput').value = password;
    updateStrengthIndicator(password);
}

function generatePin() {
    let length = parseInt(document.getElementById('pinLength').value);
    
    if (isNaN(length) || length < 1) {
        length = 16;
        document.getElementById('pinLength').value = 16;
    }

    let pin = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * 10);
        pin += randomIndex.toString();
    }

    document.getElementById('pinOutput').value = pin;
    updatePinStrengthIndicator(pin);
}

function generatePassphrase() {
    const words = [
        'apple', 'brave', 'cloud', 'dream', 'eagle', 'flame', 'grape', 'house',
        'image', 'jelly', 'knife', 'lemon', 'mango', 'night', 'ocean', 'piano',
        'quiet', 'river', 'stone', 'tiger', 'unity', 'voice', 'water', 'xenon',
        'yacht', 'zebra', 'amber', 'bloom', 'crown', 'dawn', 'earth', 'frost',
        'glass', 'heart', 'ivory', 'jewel', 'kite', 'light', 'moon', 'nebula',
        'orbit', 'prism', 'quest', 'rain', 'solar', 'thorn', 'unity', 'violet',
        'willow', 'xray', 'youth', 'zenith', 'about', 'above', 'actor', 'admit',
        'adult', 'after', 'again', 'agent', 'agree', 'ahead', 'alarm', 'album',
        'alert', 'alike', 'alive', 'allow', 'alone', 'along', 'alter', 'among',
        'anger', 'angle', 'angry', 'apart', 'apple', 'apply', 'arena', 'argue',
        'arise', 'array', 'aside', 'asset', 'audio', 'audit', 'avoid', 'award',
        'aware', 'badly', 'baker', 'bases', 'basic', 'basis', 'beach', 'began',
        'begin', 'begun', 'being', 'below', 'bench', 'billy', 'birth', 'black',
        'blame', 'blind', 'block', 'blood', 'board', 'boost', 'booth', 'bound',
        'brain', 'brand', 'bread', 'break', 'breed', 'brief', 'bring', 'broad',
        'broke', 'brown', 'build', 'built', 'buyer', 'cable', 'calm', 'came',
        'camp', 'canal', 'candy', 'card', 'cargo', 'carry', 'catch', 'cause',
        'chain', 'chair', 'chart', 'chase', 'cheap', 'check', 'chest', 'chief',
        'child', 'china', 'chose', 'civil', 'claim', 'class', 'clean', 'clear',
        'click', 'clock', 'close', 'coach', 'coast', 'could', 'count', 'court',
        'cover', 'craft', 'crash', 'cream', 'crime', 'cross', 'crowd', 'crown',
        'curve', 'cycle', 'daily', 'dance', 'dated', 'dealt', 'death', 'debut',
        'delay', 'depth', 'doing', 'doubt', 'dozen', 'draft', 'drama', 'drawn',
        'dream', 'dress', 'drill', 'drink', 'drive', 'drove', 'dying', 'eager',
        'early', 'earth', 'eight', 'elite', 'empty', 'enemy', 'enjoy', 'enter',
        'entry', 'equal', 'error', 'event', 'every', 'exact', 'exist', 'extra',
        'faith', 'false', 'fault', 'fiber', 'field', 'fifth', 'fifty', 'fight',
        'final', 'first', 'fixed', 'flash', 'fleet', 'floor', 'fluid', 'focus',
        'force', 'forth', 'forty', 'forum', 'found', 'frame', 'frank', 'fraud',
        'fresh', 'front', 'fruit', 'fully', 'funny', 'giant', 'given', 'glass',
        'globe', 'going', 'grace', 'grade', 'grand', 'grant', 'grass', 'great',
        'green', 'gross', 'group', 'grown', 'guard', 'guess', 'guest', 'guide',
        'happy', 'harry', 'heart', 'heavy', 'hence', 'henry', 'horse', 'hotel',
        'house', 'human', 'ideal', 'image', 'index', 'inner', 'input', 'issue',
        'japan', 'jimmy', 'joint', 'jones', 'judge', 'known', 'label', 'large',
        'laser', 'later', 'laugh', 'layer', 'learn', 'lease', 'least', 'leave',
        'legal', 'level', 'lewis', 'light', 'limit', 'links', 'lives', 'local',
        'logic', 'loose', 'lower', 'lucky', 'lunch', 'lying', 'magic', 'major',
        'maker', 'march', 'maria', 'match', 'maybe', 'mayor', 'meant', 'media',
        'metal', 'might', 'minor', 'minus', 'mixed', 'model', 'money', 'month',
        'moral', 'motor', 'mount', 'mouse', 'mouth', 'movie', 'music', 'needs',
        'never', 'newly', 'night', 'noise', 'north', 'noted', 'novel', 'nurse',
        'occur', 'ocean', 'offer', 'often', 'order', 'other', 'ought', 'paint',
        'panel', 'paper', 'party', 'peace', 'peter', 'phase', 'phone', 'photo',
        'piece', 'pilot', 'pitch', 'place', 'plain', 'plane', 'plant', 'plate',
        'point', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print',
        'prior', 'prize', 'proof', 'proud', 'prove', 'queen', 'quick', 'quiet',
        'quite', 'radio', 'raise', 'range', 'rapid', 'ratio', 'reach', 'ready',
        'refer', 'right', 'rival', 'river', 'robot', 'roger', 'roman', 'rough',
        'round', 'route', 'royal', 'rural', 'scale', 'scene', 'scope', 'score',
        'sense', 'serve', 'seven', 'shall', 'shape', 'share', 'sharp', 'sheet',
        'shelf', 'shell', 'shift', 'shirt', 'shock', 'shoot', 'short', 'shown',
        'sight', 'since', 'sixth', 'sixty', 'sized', 'skill', 'sleep', 'slide',
        'small', 'smart', 'smile', 'smith', 'smoke', 'solid', 'solve', 'sorry',
        'sound', 'south', 'space', 'spare', 'speak', 'speed', 'spend', 'spent',
        'split', 'spoke', 'sport', 'staff', 'stage', 'stake', 'stand', 'start',
        'state', 'steam', 'steel', 'stick', 'still', 'stock', 'stone', 'stood',
        'store', 'storm', 'story', 'strip', 'stuck', 'study', 'stuff', 'style',
        'sugar', 'suite', 'super', 'sweet', 'table', 'taken', 'taste', 'taxes',
        'teach', 'teeth', 'terry', 'texas', 'thank', 'theft', 'their', 'theme',
        'there', 'these', 'thick', 'thing', 'think', 'third', 'those', 'three',
        'threw', 'throw', 'tight', 'times', 'tired', 'title', 'today', 'topic',
        'total', 'touch', 'tough', 'tower', 'track', 'trade', 'train', 'treat',
        'trend', 'trial', 'tried', 'tries', 'truck', 'truly', 'trust', 'truth',
        'twice', 'under', 'undue', 'union', 'unity', 'until', 'upper', 'upset',
        'urban', 'usage', 'usual', 'valid', 'value', 'video', 'virus', 'visit',
        'vital', 'voice', 'waste', 'watch', 'water', 'wheel', 'where', 'which',
        'while', 'white', 'whole', 'whose', 'woman', 'world', 'worry', 'worse',
        'worst', 'worth', 'would', 'wound', 'write', 'wrong', 'wrote', 'yield',
        'young', 'youth', 'zebra'
    ];

    let wordCount = parseInt(document.getElementById('wordCount').value);
    
    if (isNaN(wordCount) || wordCount < 1) {
        wordCount = 4;
        document.getElementById('wordCount').value = 4;
    }

    const passphraseWords = [];
    for (let i = 0; i < wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        passphraseWords.push(words[randomIndex]);
    }

    const passphrase = passphraseWords.join('-');
    document.getElementById('passphraseOutput').value = passphrase;
}

function generate() {
    if (currentMode === 'password') {
        generatePassword();
    } else if (currentMode === 'pin') {
        generatePin();
    } else {
        generatePassphrase();
    }
}

function copyToClipboard(elementId, button) {
    const input = document.getElementById(elementId);
    input.select();
    input.setSelectionRange(0, 99999);
    
    const originalText = button.textContent;
    
    navigator.clipboard.writeText(input.value).then(() => {
        button.textContent = 'Copied';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        button.textContent = 'Failed';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

function setMode(mode) {
    currentMode = mode;
    const passwordToggle = document.getElementById('passwordToggle');
    const pinToggle = document.getElementById('pinToggle');
    const passphraseToggle = document.getElementById('passphraseToggle');
    const passwordLengthGroup = document.getElementById('passwordLengthGroup');
    const pinLengthGroup = document.getElementById('pinLengthGroup');
    const wordCountGroup = document.getElementById('wordCountGroup');
    const checkboxGroup = document.querySelector('.checkbox-group');
    const passwordOutputGroup = document.getElementById('passwordOutputGroup');
    const pinOutputGroup = document.getElementById('pinOutputGroup');
    const passphraseOutputGroup = document.getElementById('passphraseOutputGroup');

    if (mode === 'password') {
        passwordToggle.classList.add('active');
        pinToggle.classList.remove('active');
        passphraseToggle.classList.remove('active');
        passwordLengthGroup.style.display = 'block';
        pinLengthGroup.style.display = 'none';
        wordCountGroup.style.display = 'none';
        checkboxGroup.style.display = 'grid';
        passwordOutputGroup.style.display = 'block';
        pinOutputGroup.style.display = 'none';
        passphraseOutputGroup.style.display = 'none';
    } else if (mode === 'pin') {
        passwordToggle.classList.remove('active');
        pinToggle.classList.add('active');
        passphraseToggle.classList.remove('active');
        passwordLengthGroup.style.display = 'none';
        pinLengthGroup.style.display = 'block';
        wordCountGroup.style.display = 'none';
        checkboxGroup.style.display = 'none';
        passwordOutputGroup.style.display = 'none';
        pinOutputGroup.style.display = 'block';
        passphraseOutputGroup.style.display = 'none';
    } else {
        passwordToggle.classList.remove('active');
        pinToggle.classList.remove('active');
        passphraseToggle.classList.add('active');
        passwordLengthGroup.style.display = 'none';
        pinLengthGroup.style.display = 'none';
        wordCountGroup.style.display = 'block';
        checkboxGroup.style.display = 'none';
        passwordOutputGroup.style.display = 'none';
        pinOutputGroup.style.display = 'none';
        passphraseOutputGroup.style.display = 'block';
    }
}

// =======================================================
// GLOBAL KEYBOARD SHORTCUTS (Hidden)
// =======================================================

document.addEventListener('keydown', function(e) {
    const isInputActive = document.activeElement.tagName === 'INPUT' || 
                          document.activeElement.tagName === 'TEXTAREA' ||
                          document.activeElement.isContentEditable;
    
    // CTRL + C: Copy the current password/pin/phrase
    if (e.ctrlKey && e.key === 'c' && !isInputActive) {
        e.preventDefault();
        
        let outputId;
        if (currentMode === 'password') {
            outputId = 'passwordOutput';
        } else if (currentMode === 'pin') {
            outputId = 'pinOutput';
        } else {
            outputId = 'passphraseOutput';
        }
        
        const output = document.getElementById(outputId);
        if (output && output.value) {
            const copyButton = output.parentElement.querySelector('.action-btn');
            if (copyButton) {
                copyToClipboard(outputId, copyButton);
            } else {
                navigator.clipboard.writeText(output.value).then(() => {
                    console.log('Copied via keyboard shortcut');
                }).catch(() => {
                    output.select();
                    document.execCommand('copy');
                });
            }
        }
    }
    
    // ENTER: Generate (anywhere on page, but not when typing in inputs)
    if (e.key === 'Enter' && !isInputActive && !e.ctrlKey) {
        e.preventDefault();
        generate();
    }
    
    // CTRL + ENTER: Copy then generate
    if (e.key === 'Enter' && e.ctrlKey && !isInputActive) {
        e.preventDefault();
        
        let outputId;
        if (currentMode === 'password') {
            outputId = 'passwordOutput';
        } else if (currentMode === 'pin') {
            outputId = 'pinOutput';
        } else {
            outputId = 'passphraseOutput';
        }
        
        const output = document.getElementById(outputId);
        if (output && output.value) {
            const copyButton = output.parentElement.querySelector('.action-btn');
            if (copyButton) {
                copyToClipboard(outputId, copyButton);
            }
        }
        
        setTimeout(() => {
            generate();
        }, 300);
    }
});

// =======================================================
// END GLOBAL KEYBOARD SHORTCUTS
// =======================================================

document.getElementById('generateBtn').addEventListener('click', generate);
document.getElementById('generatePinBtn').addEventListener('click', generatePin);
document.getElementById('generatePassphraseBtn').addEventListener('click', generatePassphrase);
document.getElementById('copyBtn').addEventListener('click', function() {
    copyToClipboard('passwordOutput', this);
});
document.getElementById('copyPinBtn').addEventListener('click', function() {
    copyToClipboard('pinOutput', this);
});
document.getElementById('copyPassphraseBtn').addEventListener('click', function() {
    copyToClipboard('passphraseOutput', this);
});
document.getElementById('passwordToggle').addEventListener('click', () => setMode('password'));
document.getElementById('pinToggle').addEventListener('click', () => setMode('pin'));
document.getElementById('passphraseToggle').addEventListener('click', () => setMode('passphrase'));

document.getElementById('passwordOutput').addEventListener('input', function() {
    updateStrengthIndicator(this.value);
});

document.getElementById('pinOutput').addEventListener('input', function() {
    updatePinStrengthIndicator(this.value);
});

function autoGenerate() {
    generatePassword();
    generatePin();
    generatePassphrase();
}

window.addEventListener('DOMContentLoaded', autoGenerate);

document.getElementById('passwordLength').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generate();
    }
});

document.getElementById('pinLength').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generatePin();
    }
});

document.getElementById('wordCount').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generate();
    }
});

setMode('password');