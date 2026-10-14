export interface ParsedBooking {
  pickup: string;
  destination: string;
  time: string;
  passengers: number;
  raw: string;
}

export function parseBookingSentence(sentence: string): ParsedBooking {
  const text = sentence.trim();

  // Default values
  let pickup = 'Ghaziabad';
  let destination = 'New Delhi Railway Station';
  let time = 'Tomorrow, 7:00 AM';
  let passengers = 3;

  if (!text) {
    return { pickup, destination, time, passengers, raw: text };
  }

  // 1. Extract passenger count
  const paxMatch =
    text.match(/(?:for|with|,)?\s*(\d+)\s*(?:passengers?|people|pax|riders?|guests?|persons?|sawari|log)/i) ||
    text.match(/\b(\d+)\s*(?:passengers?|people|pax|riders?|guests?|persons?|sawari|log)\b/i);

  if (paxMatch && paxMatch[1]) {
    const parsedPax = parseInt(paxMatch[1], 10);
    if (!isNaN(parsedPax) && parsedPax > 0) {
      passengers = parsedPax;
    }
  }

  // 2. Extract Date and Time
  const hasKal = /\b(?:kal|tomorrow)\b/i.test(text);
  const hasSubah = /\b(?:subah|morning|am)\b/i.test(text);
  const hasShaam = /\b(?:shaam|evening|raat|night|pm)\b/i.test(text);

  // Match e.g. "7 baje", "7:00 AM", "7:30 pm", "7am"
  const bajeMatch = text.match(/(\d{1,2}(?::\d{2})?)\s*(?:baje|am|pm)?/i);
  const clockMatch =
    text.match(/(?:at|around|by)?\s*(\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm))/i) ||
    text.match(/(\d{1,2})\s*baje/i);

  if (hasKal) {
    let hourStr = '7:00 AM';
    if (bajeMatch && bajeMatch[1]) {
      const num = parseInt(bajeMatch[1], 10);
      const isPm = hasShaam || (num >= 1 && num <= 6 && !hasSubah);
      const suffix = isPm ? 'PM' : 'AM';
      hourStr = `${num}:00 ${suffix}`;
    } else if (clockMatch && clockMatch[1]) {
      hourStr = clockMatch[1].toUpperCase();
    }
    time = `Tomorrow, ${hourStr}`;
  } else if (clockMatch && clockMatch[1]) {
    time = `Today, ${clockMatch[1].toUpperCase()}`;
  } else if (text.match(/\b(?:today|aaj)\b/i)) {
    time = 'Today, 7:00 PM';
  }

  // 3. Extract pickup and destination
  // Strip temporal prefix like "Kal subah 7 baje" or "Tomorrow at 7am" for route parsing
  const cleanRouteText = text
    .replace(/^(?:kal\s+(?:subah|shaam)?\s*\d*(?:\s*baje)?\s*|tomorrow\s*(?:at\s*\d+[:0-9]*(?:\s*[ap]m)?)?\s*)/i, '')
    .trim();

  // Pattern A: "Ghaziabad se New Delhi Railway Station" (Hindi/Hinglish 'se')
  const seMatch = cleanRouteText.match(
    /(?:from\s+|pick(?:\s*me)?\s*up\s*(?:at|from)\s+)?(.+?)\s+se\s+(.+?)(?=\s*,\s*|\s+(?:at|around|by|for|with|\d+\s*passengers?|$))/i
  );

  // Pattern B: "... from X to Y ..." or "X to Y"
  const toMatch = cleanRouteText.match(
    /(?:pick(?:\s*me)?\s*up\s*(?:at|from)|ride\s*from|from)?\s*(.+?)\s+(?:to|heading\s*to|going\s*to)\s+(.+?)(?=\s*,\s*|\s+(?:at|around|by|for|with|\d+\s*passengers?|$))/i
  );

  if (seMatch && seMatch[1] && seMatch[2]) {
    pickup = cleanLocation(seMatch[1]);
    destination = cleanLocation(seMatch[2]);
  } else if (toMatch && toMatch[1] && toMatch[2]) {
    pickup = cleanLocation(toMatch[1]);
    destination = cleanLocation(toMatch[2]);
  }

  return {
    pickup,
    destination,
    time,
    passengers,
    raw: text,
  };
}

function cleanLocation(str: string): string {
  if (!str) return '';
  return str
    .replace(/^(?:at|from|the)\s+/i, '')
    .replace(/\s+(?:at|for|with)$/i, '')
    .replace(/[,\.]$/, '')
    .trim();
}
