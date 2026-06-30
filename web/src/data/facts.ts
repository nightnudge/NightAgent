/**
 * Faktenpool – ported 1:1 from NightAgent/NotificationContent.swift.
 * Sachlich, keine Panik-Sprache, keine harten Heilversprechen.
 */

export type FactType = 'positive' | 'direct'

export interface Fact {
  title: string
  body: string
  type: FactType
}

export const FACT_POOL: Fact[] = [
  // Positive Fakten (erscheinen in beiden Faktenmodi)
  {
    title: 'Stimmung & Stabilität',
    body: 'Guter Schlaf unterstützt Stimmung und emotionale Stabilität.',
    type: 'positive',
  },
  {
    title: 'Kreativer morgen früh',
    body: 'Guter Schlaf kann Kreativität und Problemlösen unterstützen.',
    type: 'positive',
  },
  {
    title: 'Besser konzentriert',
    body: 'Weniger Handyzeit vor dem Schlafen kann Lernen und Konzentration am nächsten Tag unterstützen.',
    type: 'positive',
  },
  {
    title: 'Dein Gehirn erholt sich',
    body: 'Im Schlaf laufen wichtige Aufräum- und Erholungsprozesse im Gehirn.',
    type: 'positive',
  },
  {
    title: 'Eine Nacht kann reichen',
    body: 'Schon eine gute Erholungsnacht kann helfen, Folgen von Schlafmangel zu verbessern.',
    type: 'positive',
  },

  // Direkte Fakten (erscheinen nur in Faktenmodus "Positiv + Direkt")
  {
    title: 'Innere Uhr',
    body: 'Abendliches Bildschirmlicht kann Melatonin unterdrücken und deine innere Uhr nach hinten schieben.',
    type: 'direct',
  },
  {
    title: 'Schlechtere Erholung',
    body: 'Smartphone-Nutzung im Bett kann mit höherer Herzfrequenz und schlechterer Erholung zusammenhängen.',
    type: 'direct',
  },
  {
    title: 'Emotionale Kontrolle',
    body: 'Schlafmangel kann emotionale Kontrolle verschlechtern und impulsivere Reaktionen begünstigen.',
    type: 'direct',
  },
  {
    title: 'Kognitive Leistung',
    body: 'Zwei Wochen mit nur 6 Stunden Schlaf pro Nacht können die kognitive Leistung deutlich verschlechtern.',
    type: 'direct',
  },
  {
    title: 'Display stört Schlaf',
    body: 'Lichtemittierende Geräte vor dem Schlafen können Einschlafen, innere Uhr und Aufmerksamkeit am Morgen stören.',
    type: 'direct',
  },
  {
    title: 'Nächtliche Erholung',
    body: 'Handy-Nutzung im Bett wird mit schlechterer nächtlicher Erholung verbunden.',
    type: 'direct',
  },
  {
    title: 'Lernen fällt schwerer',
    body: 'Schlafmangel kann es deutlich schwerer machen, neue Informationen aufzunehmen.',
    type: 'direct',
  },
  {
    title: 'Reaktionsfähigkeit',
    body: 'Übermüdung kann Aufmerksamkeit, Reaktionsfähigkeit und Entscheidungen verschlechtern.',
    type: 'direct',
  },
]

/**
 * Returns the next fact for the given mode, avoiding an immediate repeat.
 * Ported from `nextFact(lastIndex:factMode:)`.
 */
export function nextFact(lastIndex: number, factMode: 0 | 1): { fact: Fact; index: number } {
  const pool = factMode === 0 ? FACT_POOL.filter((f) => f.type === 'positive') : FACT_POOL

  if (pool.length === 0) {
    return { fact: { title: 'Zeit für Schlaf', body: 'Leg das Handy weg.', type: 'positive' }, index: 0 }
  }

  let next = (lastIndex + 1) % pool.length
  if (pool.length > 1 && next === lastIndex % pool.length) {
    next = (next + 1) % pool.length
  }
  return { fact: pool[next], index: next }
}
