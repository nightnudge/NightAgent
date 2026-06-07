// NightAgent – Notification Scheduler
import Foundation
import UserNotifications

struct NotificationScheduler {

    // MARK: - Kategorien registrieren (einmal beim App-Start)

    static func registerCategories() {
        let confirm = UNNotificationAction(identifier: "ACTION_CONFIRM",
                                           title: "Bestätigt ✓", options: [])
        let snooze  = UNNotificationAction(identifier: "ACTION_SNOOZE",
                                           title: "Noch 5 Min",   options: [])
        let skip    = UNNotificationAction(identifier: "ACTION_SKIP",
                                           title: "Heute aussetzen", options: [.destructive])
        let category = UNNotificationCategory(identifier: "NIGHT_REMINDER",
                                              actions: [confirm, snooze, skip],
                                              intentIdentifiers: [], options: [])
        UNUserNotificationCenter.current().setNotificationCategories([category])
    }

    // MARK: - Permission anfragen

    static func requestPermission() async -> Bool {
        do {
            return try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .sound, .badge])
        } catch { return false }
    }

    // MARK: - Alle Notifications planen

    static func scheduleNotifications(for settings: AppSettings) {
        let enabled        = settings.notificationsEnabled
        let offsets        = settings.reminderOffsets
        let factMode       = settings.factMode
        let annoyanceLevel = settings.annoyanceLevel
        let sleepTime      = settings.sleepTime

        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        guard enabled else { return }

        let cal    = Calendar.current
        let sleepH = cal.component(.hour,   from: sleepTime)
        let sleepM = cal.component(.minute, from: sleepTime)

        var lastIndex = settings.lastFactIndex

        // Normale Erinnerungen VOR Schlafenszeit
        for (i, offset) in offsets.enumerated() {
            let (fact, newIndex) = nextFact(lastIndex: lastIndex, factMode: factMode)
            lastIndex = newIndex
            scheduleAt(
                id:          "night_reminder_\(i)",
                title:       "Noch \(offset) Min. bis Schlafzeit",
                body:        fact.body,
                sleepHour:   sleepH,
                sleepMinute: sleepM,
                minutesDelta: -offset          // negativ = vor Schlafenszeit
            )
        }

        // Follow-up Notifications NACH Schlafenszeit (Streng + Sehr streng)
        //   Normal (1)      → 1 Follow-up nach  5 Min
        //   Streng (2)      → 2 Follow-ups nach 15, 30 Min
        //   Sehr streng (3) → 3 Follow-ups nach  5, 20, 40 Min
        let followUpMinutes: [Int]
        switch annoyanceLevel {
        case 1:  followUpMinutes = [5]
        case 2:  followUpMinutes = [15, 30]
        case 3:  followUpMinutes = [5, 20, 40]
        default: followUpMinutes = []           // Sanft: keine Follow-ups
        }

        for (i, minutes) in followUpMinutes.enumerated() {
            let (fact, newIndex) = nextFact(lastIndex: lastIndex, factMode: factMode)
            lastIndex = newIndex
            scheduleAt(
                id:           "night_followup_\(i)",
                title:        "Du bist über deiner Schlafzeit",
                body:         fact.body,
                sleepHour:    sleepH,
                sleepMinute:  sleepM,
                minutesDelta: minutes           // positiv = nach Schlafenszeit
            )
        }

        DispatchQueue.main.async { settings.lastFactIndex = lastIndex }
    }

    // MARK: - Follow-ups löschen (nach Bestätigung)

    static func cancelFollowUps() {
        UNUserNotificationCenter.current().getPendingNotificationRequests { requests in
            let ids = requests
                .filter {
                    $0.identifier.hasPrefix("night_followup_") ||
                    $0.identifier == "night_snooze"
                }
                .map { $0.identifier }
            UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ids)
        }
    }

    static func cancelAll() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }

    // MARK: - Intern: Notification zur absoluten Uhrzeit planen
    // minutesDelta: negativ = vor Schlafenszeit, positiv = nach Schlafenszeit

    private static func scheduleAt(
        id: String, title: String, body: String,
        sleepHour: Int, sleepMinute: Int, minutesDelta: Int
    ) {
        let content                = UNMutableNotificationContent()
        content.title              = title
        content.body               = body
        content.sound              = .default
        content.categoryIdentifier = "NIGHT_REMINDER"

        var total = sleepHour * 60 + sleepMinute + minutesDelta
        if total < 0        { total += 24 * 60 }
        if total >= 24 * 60 { total -= 24 * 60 }

        var components    = DateComponents()
        components.hour   = total / 60
        components.minute = total % 60

        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }
}
