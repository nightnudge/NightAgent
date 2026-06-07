// NightAgent – Small Widget
import WidgetKit
import SwiftUI

// MARK: - Shared Keys (identisch mit AppSettings)
private let appGroupID  = "group.com.maubach.NightAgent"

// MARK: - Timeline Entry (die Daten die das Widget anzeigt)

struct NightEntry: TimelineEntry {
    let date:           Date
    let sleepTime:      Date
    let wakeTime:       Date
    let todayConfirmed: Bool
}

// MARK: - Provider (liest Daten + entscheidet wann Widget neu lädt)

struct NightProvider: TimelineProvider {

    func placeholder(in context: Context) -> NightEntry {
        NightEntry(date: .now, sleepTime: defaultSleep(), wakeTime: defaultWake(), todayConfirmed: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (NightEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NightEntry>) -> Void) {
        let entry      = currentEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: .now)!
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    // Liest echte Werte aus App Group UserDefaults
    private func currentEntry() -> NightEntry {
        let store     = UserDefaults(suiteName: appGroupID) ?? .standard
        let sleep     = (store.object(forKey: "sleepTime") as? Date) ?? defaultSleep()
        let wake      = (store.object(forKey: "wakeTime")  as? Date) ?? defaultWake()
        let confirmed = store.bool(forKey: "todayConfirmed")
        return NightEntry(date: .now, sleepTime: sleep, wakeTime: wake, todayConfirmed: confirmed)
    }

    private func defaultSleep() -> Date {
        Calendar.current.date(bySettingHour: 22, minute: 30, second: 0, of: .now)!
    }
    private func defaultWake() -> Date {
        Calendar.current.date(bySettingHour: 7, minute: 0, second: 0, of: .now)!
    }
}

// MARK: - Widget View

struct NightWidgetView: View {
    let entry: NightEntry

    var body: some View {
        ZStack {
            Color(hex: "0A1F0F")
            VStack(alignment: .leading, spacing: 0) {

                // Header: Icon + Name
                HStack(spacing: 4) {
                    Image(systemName: "moon.stars.fill")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(Color(hex: "2E7D4F"))
                    Text("NightAgent")
                        .font(.system(.caption2, design: .rounded, weight: .semibold))
                        .foregroundStyle(Color(hex: "2E7D4F"))
                }
                .padding(.bottom, 8)

                // Label: "Bis Schlafzeit" oder "Schlaf möglich"
                Text(countdownLabel.uppercased())
                    .font(.system(size: 9, weight: .medium, design: .rounded))
                    .foregroundStyle(Color(hex: "81C784").opacity(0.8))
                    .tracking(0.8)
                    .padding(.bottom, 2)

                // Countdown-Zeit gross
                Text(countdownTime)
                    .font(.system(size: 30, weight: .thin, design: .rounded))
                    .foregroundStyle(Color(hex: "E8F5E9"))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                    .padding(.bottom, 4)

                // Ziel-Uhrzeit
                Text("Ziel: \(clockString(entry.sleepTime))")
                    .font(.system(.caption2, design: .rounded))
                    .foregroundStyle(Color(hex: "81C784").opacity(0.6))

                Spacer()

                // Bestätigt-Badge
                if entry.todayConfirmed {
                    HStack(spacing: 3) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 9))
                        Text("Bestätigt")
                            .font(.system(size: 9, weight: .medium, design: .rounded))
                    }
                    .foregroundStyle(Color(hex: "4CAF50"))
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }

    // MARK: - Logik

    private var isPastBedtime: Bool {
        let cal  = Calendar.current
        let nowM = cal.component(.hour, from: entry.date)      * 60 + cal.component(.minute, from: entry.date)
        let slpM = cal.component(.hour, from: entry.sleepTime) * 60 + cal.component(.minute, from: entry.sleepTime)
        let diff = slpM - nowM
        return diff < 0 || diff > 12 * 60
    }

    private var countdownLabel: String {
        isPastBedtime ? "Schlaf möglich" : "Bis Schlafzeit"
    }

    private var countdownTime: String {
        let target  = isPastBedtime ? entry.wakeTime : entry.sleepTime
        let minutes = minutesUntil(target, from: entry.date)
        return formatDuration(minutes)
    }

    private func minutesUntil(_ target: Date, from now: Date) -> Int {
        let cal  = Calendar.current
        let nowM = cal.component(.hour, from: now)    * 60 + cal.component(.minute, from: now)
        let tgtM = cal.component(.hour, from: target) * 60 + cal.component(.minute, from: target)
        let diff = tgtM - nowM
        return diff > 0 ? diff : diff + 24 * 60
    }

    private func formatDuration(_ minutes: Int) -> String {
        let h = minutes / 60
        let m = minutes % 60
        return m > 0 ? "\(h)h \(m)m" : "\(h)h"
    }

    private func clockString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "HH:mm"
        return f.string(from: date)
    }
}

// Farb-Helfer (Widget kann NightColors aus der App nicht direkt verwenden)
extension Color {
    init(hex: String) {
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        self.init(
            red:   Double((int >> 16) & 0xFF) / 255,
            green: Double((int >> 8)  & 0xFF) / 255,
            blue:  Double(int         & 0xFF) / 255
        )
    }
}

// MARK: - Widget Konfiguration

struct NightAgentWidget: Widget {
    let kind = "NightAgentWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NightProvider()) { entry in
            NightWidgetView(entry: entry)
                .containerBackground(Color(hex: "0A1F0F"), for: .widget)
        }
        .configurationDisplayName("NightAgent")
        .description("Zeigt deinen Schlaf-Countdown.")
        .supportedFamilies([.systemSmall])
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    NightAgentWidget()
} timeline: {
    NightEntry(
        date:           .now,
        sleepTime:      Calendar.current.date(bySettingHour: 22, minute: 30, second: 0, of: .now)!,
        wakeTime:       Calendar.current.date(bySettingHour:  7, minute:  0, second: 0, of: .now)!,
        todayConfirmed: false
    )
}
