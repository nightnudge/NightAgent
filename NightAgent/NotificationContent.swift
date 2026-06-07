// NightAgent – Faktenpool
import Foundation

// MARK: - Datenstruktur

struct NotificationMessage {
    let title: String
    let body: String
    let type: MessageType

    enum MessageType {
        case positive   // Nur positive Fakten (Faktenmodus 0)
        case direct     // Direkte/nüchterne Fakten (Faktenmodus 1, zusätzlich zu positive)
    }
}

// MARK: - Faktenpool

/// Alle Fakten. Sachlich, keine Panik-Sprache, keine harten Heilversprechen.
let notificationPool: [NotificationMessage] = [

    // MARK: Positive Fakten (erscheinen in beiden Faktenmodi)

    NotificationMessage(
        title: "Stimmung & Stabilität",
        body: "Guter Schlaf unterstützt Stimmung und emotionale Stabilität.",
        type: .positive
    ),
    NotificationMessage(
        title: "Kreativer morgen früh",
        body: "Guter Schlaf kann Kreativität und Problemlösen unterstützen.",
        type: .positive
    ),
    NotificationMessage(
        title: "Besser konzentriert",
        body: "Weniger Handyzeit vor dem Schlafen kann Lernen und Konzentration am nächsten Tag unterstützen.",
        type: .positive
    ),
    NotificationMessage(
        title: "Dein Gehirn erholt sich",
        body: "Im Schlaf laufen wichtige Aufräum- und Erholungsprozesse im Gehirn.",
        type: .positive
    ),
    NotificationMessage(
        title: "Eine Nacht kann reichen",
        body: "Schon eine gute Erholungsnacht kann helfen, Folgen von Schlafmangel zu verbessern.",
        type: .positive
    ),

    // MARK: Direkte Fakten (erscheinen nur in Faktenmodus "Positiv + Direkt")

    NotificationMessage(
        title: "Innere Uhr",
        body: "Abendliches Bildschirmlicht kann Melatonin unterdrücken und deine innere Uhr nach hinten schieben.",
        type: .direct
    ),
    NotificationMessage(
        title: "Schlechtere Erholung",
        body: "Smartphone-Nutzung im Bett kann mit höherer Herzfrequenz und schlechterer Erholung zusammenhängen.",
        type: .direct
    ),
    NotificationMessage(
        title: "Emotionale Kontrolle",
        body: "Schlafmangel kann emotionale Kontrolle verschlechtern und impulsivere Reaktionen begünstigen.",
        type: .direct
    ),
    NotificationMessage(
        title: "Kognitive Leistung",
        body: "Zwei Wochen mit nur 6 Stunden Schlaf pro Nacht können die kognitive Leistung deutlich verschlechtern.",
        type: .direct
    ),
    NotificationMessage(
        title: "Display stört Schlaf",
        body: "Lichtemittierende Geräte vor dem Schlafen können Einschlafen, innere Uhr und Aufmerksamkeit am Morgen stören.",
        type: .direct
    ),
    NotificationMessage(
        title: "Nächtliche Erholung",
        body: "Handy-Nutzung im Bett wird mit schlechterer nächtlicher Erholung verbunden.",
        type: .direct
    ),
    NotificationMessage(
        title: "Lernen fällt schwerer",
        body: "Schlafmangel kann es deutlich schwerer machen, neue Informationen aufzunehmen.",
        type: .direct
    ),
    NotificationMessage(
        title: "Reaktionsfähigkeit",
        body: "Übermüdung kann Aufmerksamkeit, Reaktionsfähigkeit und Entscheidungen verschlechtern.",
        type: .direct
    ),
]

// MARK: - Hilfsfunktion: Nächster Fakt

/// Gibt den nächsten Fakt zurück, passend zum Faktenmodus.
/// - Parameter lastIndex: Letzter verwendeter Index (wird nicht direkt wiederholt)
/// - Parameter factMode: 0 = nur Positive, 1 = Positive + Direkte
func nextFact(lastIndex: Int, factMode: Int) -> (message: NotificationMessage, index: Int) {
    let pool = factMode == 0
        ? notificationPool.filter { $0.type == .positive }
        : notificationPool

    guard !pool.isEmpty else {
        return (NotificationMessage(title: "Zeit für Schlaf", body: "Leg das Handy weg.", type: .positive), 0)
    }

    // Nicht denselben Index wie zuletzt nehmen
    var next = (lastIndex + 1) % pool.count
    if pool.count > 1 && next == lastIndex % pool.count {
        next = (next + 1) % pool.count
    }
    return (pool[next], next)
}
