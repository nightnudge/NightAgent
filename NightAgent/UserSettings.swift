// NightAgent – AppSettings
import Foundation
import Combine

final class AppSettings: ObservableObject {

    static let shared = AppSettings()
    private let store: UserDefaults

    // MARK: Schlaf / Aufwachen
    @Published var sleepTime: Date {
        didSet { store.set(sleepTime, forKey: "sleepTime") }
    }
    @Published var wakeTime: Date {
        didSet { store.set(wakeTime, forKey: "wakeTime") }
    }

    // MARK: Notifications
    @Published var notificationsEnabled: Bool {
        didSet { store.set(notificationsEnabled, forKey: "notificationsEnabled") }
    }
    @Published var reminderOffsets: [Int] {        // Minuten vor Schlafenszeit
        didSet { store.set(reminderOffsets, forKey: "reminderOffsets") }
    }

    // MARK: Verhalten
    @Published var annoyanceLevel: Int {           // 0 Sanft · 1 Normal · 2 Streng · 3 Sehr streng
        didSet { store.set(annoyanceLevel, forKey: "annoyanceLevel") }
    }
    @Published var factMode: Int {                 // 0 Positiv · 1 Positiv+Direkt
        didSet { store.set(factMode, forKey: "factMode") }
    }

    // MARK: Status
    @Published var onboardingDone: Bool {
        didSet { store.set(onboardingDone, forKey: "onboardingDone") }
    }
    @Published var todayConfirmed: Bool {
        didSet { store.set(todayConfirmed, forKey: "todayConfirmed") }
    }
    @Published var todayConfirmedDate: Date? {
        didSet { store.set(todayConfirmedDate, forKey: "todayConfirmedDate") }
    }
    @Published var lastFactIndex: Int {
        didSet { store.set(lastFactIndex, forKey: "lastFactIndex") }
    }

    // MARK: Berechnet
    var sleepDurationMinutes: Int {
        let cal = Calendar.current
        let sh = cal.component(.hour, from: sleepTime) * 60 + cal.component(.minute, from: sleepTime)
        let wh = cal.component(.hour, from: wakeTime)  * 60 + cal.component(.minute, from: wakeTime)
        let diff = wh - sh
        return diff > 0 ? diff : diff + 24 * 60
    }

    // MARK: Init
    // App Group ID – muss in beiden Targets (App + Widget) identisch sein
    static let appGroupID = "group.com.maubach.NightAgent"

    init() {
        // App Group UserDefaults: ermöglicht Datenaustausch mit dem Widget
        self.store = UserDefaults(suiteName: AppSettings.appGroupID) ?? .standard

        let cal          = Calendar.current
        let now          = Date()
        let defaultSleep = cal.date(bySettingHour: 22, minute: 30, second: 0, of: now)!
        let defaultWake  = cal.date(bySettingHour:  7, minute:  0, second: 0, of: now)!

        sleepTime            = (store.object(forKey: "sleepTime") as? Date) ?? defaultSleep
        wakeTime             = (store.object(forKey: "wakeTime")  as? Date) ?? defaultWake
        notificationsEnabled = store.bool(forKey: "notificationsEnabled")
        reminderOffsets      = (store.array(forKey: "reminderOffsets") as? [Int]) ?? [60, 30]
        annoyanceLevel       = store.integer(forKey: "annoyanceLevel")
        factMode             = store.integer(forKey: "factMode")
        onboardingDone       = store.bool(forKey: "onboardingDone")
        lastFactIndex        = store.integer(forKey: "lastFactIndex")

        // Tagesbestätigung zurücksetzen, wenn nicht heute bestätigt wurde
        let confirmed   = store.bool(forKey: "todayConfirmed")
        let confirmDate = store.object(forKey: "todayConfirmedDate") as? Date
        if let confirmDate, cal.isDateInToday(confirmDate) {
            todayConfirmed     = confirmed
            todayConfirmedDate = confirmDate
        } else {
            todayConfirmed     = false
            todayConfirmedDate = nil
        }
    }

    // MARK: Aktionen
    func confirmToday() {
        todayConfirmed     = true
        todayConfirmedDate = Date()
    }
}
