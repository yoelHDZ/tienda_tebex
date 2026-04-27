import fs from 'fs';
import path from 'path';
import en from '../messages/en.json';
import fr from '../messages/fr.json';
import es from '../messages/es.json';
import de from '../messages/de.json';
import nl from '../messages/nl.json';
import pl from '../messages/pl.json';
import tr from '../messages/tr.json';

const messagesDir = path.join(process.cwd(), 'messages');

const bundledMessages = {
  en,
  fr,
  es,
  de,
  nl,
  pl,
  tr
};

function normaliseLocale(locale) {
  const value = String(locale || '').trim().toLowerCase();
  const safe = value.replace(/[^a-z0-9-_]/g, '');
  return safe || 'en';
}

function localeFilePath(locale) {
  return path.join(messagesDir, `${normaliseLocale(locale)}.json`);
}

function readLocaleFromDisk(locale) {
  try {
    const filePath = localeFilePath(locale);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function listLocales() {
  const locales = new Set(Object.keys(bundledMessages));
  try {
    if (fs.existsSync(messagesDir)) {
      const files = fs.readdirSync(messagesDir);
      files
        .filter((file) => file.endsWith('.json'))
        .forEach((file) => locales.add(file.replace('.json', '').toLowerCase()));
    }
  } catch {}
  return Array.from(locales);
}

export function hasLocale(locale) {
  const code = normaliseLocale(locale);
  if (bundledMessages[code]) return true;
  const filePath = localeFilePath(code);
  return fs.existsSync(filePath);
}

export function readLocaleMessages(locale) {
  const code = normaliseLocale(locale);
  const diskMessages = readLocaleFromDisk(code);
  if (diskMessages) {
    return {
      locale: code,
      messages: diskMessages,
      source: 'disk'
    };
  }
  const bundled = bundledMessages[code] || bundledMessages.en || {};
  return {
    locale: bundledMessages[code] ? code : 'en',
    messages: bundled,
    source: 'bundle'
  };
}

export function canWriteLocales() {
  try {
    if (!fs.existsSync(messagesDir)) {
      fs.mkdirSync(messagesDir, { recursive: true });
    }
    fs.accessSync(messagesDir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export function writeLocaleMessages(locale, messages) {
  const code = normaliseLocale(locale);
  const filePath = localeFilePath(code);
  const data = JSON.stringify(messages, null, 2);
  fs.writeFileSync(filePath, data, 'utf8');
  return code;
}
