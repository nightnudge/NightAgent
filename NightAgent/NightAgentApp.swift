// NightAgent
import SwiftUI
import UserNotifications

// MARK: - Notification Delegate
// Diese Klasse reagiert auf Taps auf Notification-Buttons

class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate {

    // Nutzer hat einen Action-Button in der Notification getippt
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        let settings = AppSettings.shared

        switch response.actionIdentifier {

        case "ACTION_CONFIRM":
            // „Bestätigt" → Tagesbestätigung speichern + Follow-ups löschen
            DispatchQueue.main.async { settings.confirmToday() }
            NotificationScheduler.cancelFollowUps()

        case "ACTION_SNOOZE":
            // „Noch 5 Min" → Snooze-Notification in 5 Minuten
            scheduleSnooze()

        case "ACTION_SKIP":
            // „Heute aussetzen" → alle heutigen NightAgent-Notifications löschen
            center.getPendingNotificationRequests { requests in
                let ids = requests
                    .filter { $0.identifier.hasPrefix("night_") }
                    .map { $0.identifier }
                center.removePendingNotificationRequests(withIdentifiers: ids)
            }

        default:
            break
        }

        completionHandler()
    }

    // Notification auch anzeigen wenn App im Vordergrund ist
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound])
    }

    // Snooze: eine einmalige Notification in 5 Minuten
    private func scheduleSnooze() {
        let content = UNMutableNotificationContent()
        content.title = "Handy noch da? 👀"
        content.body = "Deine 5 Minuten sind um. Leg es jetzt weg."
        content.sound = .default
        content.categoryIdentifier = "NIGHT_REMINDER"

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5 * 60, repeats: false)
        let request = UNNotificationRequest(identifier: "night_snooze",
                                            content: content,
                                            trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }
}

// MARK: - App

@main
struct NightAgentApp: App {
    @StateObject private var settings = AppSettings.shared

    // static = bleibt am Leben (UNUserNotificationCenter hält Delegate nur schwach)
    static let notificationDelegate = NotificationDelegate()

    init() {
        UNUserNotificationCenter.current().delegate = NightAgentApp.notificationDelegate
        NotificationScheduler.registerCategories()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(settings)
        }
    }
}
