// NightAgent – Settings Screen
import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var settings: AppSettings
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                timesSection
                notificationsSection
                behaviourSection
                testSection
                sleepDurationSection
            }
            .scrollContentBackground(.hidden)
            .background(Color.nightBgPrimary.ignoresSafeArea())
            .navigationTitle("Einstellungen")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Color.nightBgPrimary, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Fertig") { dismiss() }
                        .foregroundStyle(Color.nightAccentGlow)
                        .fontDesign(.rounded)
                }
            }
        }
        .preferredColorScheme(.dark)
    }

    // MARK: - Zeiten

    private var timesSection: some View {
        Section {
            DatePicker("Schlafzeit", selection: $settings.sleepTime, displayedComponents: .hourAndMinute)
                .listRowBackground(Color.nightBgSecondary)
                .foregroundStyle(Color.nightTextPrimary)
                .onChange(of: settings.sleepTime) { _, _ in reschedule() }

            DatePicker("Aufwachzeit", selection: $settings.wakeTime, displayedComponents: .hourAndMinute)
                .listRowBackground(Color.nightBgSecondary)
                .foregroundStyle(Color.nightTextPrimary)
        } header: {
            sectionHeader("Zeiten")
        }
    }

    // MARK: - Notifications

    private var notificationsSection: some View {
        Section {
            HStack {
                Text("Benachrichtigungen")
                    .foregroundStyle(Color.nightTextPrimary)
                Spacer()
                Toggle("", isOn: $settings.notificationsEnabled)
                    .onChange(of: settings.notificationsEnabled) { _, enabled in
                        if enabled {
                            Task {
                                let granted = await NotificationScheduler.requestPermission()
                                if granted {
                                    NotificationScheduler.scheduleNotifications(for: settings)
                                } else {
                                    settings.notificationsEnabled = false
                                }
                            }
                        } else {
                            NotificationScheduler.cancelAll()
                        }
                    }
            }
            .listRowBackground(Color.nightBgSecondary)

            if settings.notificationsEnabled {
                ForEach(settings.reminderOffsets.indices, id: \.self) { i in
                    HStack {
                        Text("Erinnerung \(i + 1)")
                            .foregroundStyle(Color.nightTextPrimary)
                        Spacer()
                        Stepper(
                            "\(settings.reminderOffsets[i]) Min. vorher",
                            value: Binding(
                                get: { settings.reminderOffsets[i] },
                                set: { settings.reminderOffsets[i] = $0; reschedule() }
                            ),
                            in: 5...120, step: 5
                        )
                        .fixedSize()
                        .foregroundStyle(Color.nightTextPrimary)
                    }
                    .listRowBackground(Color.nightBgSecondary)
                }
                .onDelete { indexSet in
                    // Mindestens 1 Erinnerung muss bleiben
                    guard settings.reminderOffsets.count > 1 else { return }
                    settings.reminderOffsets.remove(atOffsets: indexSet)
                    reschedule()
                }

                if settings.reminderOffsets.count < 4 {
                    Button("+ Erinnerung hinzufügen") {
                        settings.reminderOffsets.append(15)
                        reschedule()
                    }
                    .foregroundStyle(Color.nightAccentGlow)
                    .listRowBackground(Color.nightBgSecondary)
                }
            }
        } header: {
            sectionHeader("Benachrichtigungen")
        }
    }

    // MARK: - Verhalten

    private var behaviourSection: some View {
        Section {
            Picker("Nervfaktor", selection: $settings.annoyanceLevel) {
                Text("Sanft").tag(0)
                Text("Normal").tag(1)
                Text("Streng").tag(2)
                Text("Sehr streng").tag(3)
            }
            .foregroundStyle(Color.nightTextPrimary)
            .listRowBackground(Color.nightBgSecondary)

            Picker("Faktenmodus", selection: $settings.factMode) {
                Text("Positiv").tag(0)
                Text("Positiv + Direkt").tag(1)
            }
            .foregroundStyle(Color.nightTextPrimary)
            .listRowBackground(Color.nightBgSecondary)
        } header: {
            sectionHeader("Verhalten")
        } footer: {
            Group {
                switch settings.annoyanceLevel {
                case 0: Text("Sanft: Nur normale Erinnerungen.")
                case 1: Text("Normal: Erinnerungen + Hinweis wenn du über der Schlafzeit bist.")
                case 2: Text("Streng: Zusätzliche Folge-Notifications, wenn du nicht bestätigt hast.")
                case 3: Text("Sehr streng: Folge-Notifications + Bestätigungs-Screen beim App-Öffnen.")
                default: EmptyView()
                }
            }
            .foregroundStyle(Color.nightTextSecondary.opacity(0.6))
            .font(.system(.caption, design: .rounded))
        }
    }

    // MARK: - Test

    private var testSection: some View {
        Section {
            Button("🔔 Test-Notification in 10 Sek.") {
                scheduleTestNotification()
            }
            .foregroundStyle(Color.nightAccentGlow)
            .listRowBackground(Color.nightBgSecondary)

            Button("🔄 Heutige Bestätigung zurücksetzen") {
                settings.todayConfirmed = false
                settings.todayConfirmedDate = nil
            }
            .foregroundStyle(Color.nightStatusYellow)
            .listRowBackground(Color.nightBgSecondary)
        } header: {
            sectionHeader("Entwickler-Test")
        } footer: {
            Text("Schickt sofort eine Notification zum Testen der Action-Buttons.")
                .foregroundStyle(Color.nightTextSecondary.opacity(0.5))
                .font(.system(.caption, design: .rounded))
        }
    }

    private func scheduleTestNotification() {
        let content = UNMutableNotificationContent()
        content.title = "Test: Noch 30 Min. bis Schlafzeit"
        content.body  = "Guter Schlaf unterstützt Stimmung und emotionale Stabilität."
        content.sound = .default
        content.categoryIdentifier = "NIGHT_REMINDER"

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 10, repeats: false)
        let request = UNNotificationRequest(identifier: "night_test", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }

    // MARK: - Schlafdauer

    private var sleepDurationSection: some View {
        Section {
            HStack {
                Text("Schlafdauer")
                    .foregroundStyle(Color.nightTextPrimary)
                Spacer()
                Text(formatDuration(settings.sleepDurationMinutes))
                    .foregroundStyle(Color.nightTextSecondary)
                    .fontDesign(.rounded)
            }
            .listRowBackground(Color.nightBgSecondary)
        } header: {
            sectionHeader("Übersicht")
        }
    }

    // MARK: - Hilfsfunktionen

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .foregroundStyle(Color.nightTextSecondary)
            .font(.system(.footnote, design: .rounded))
    }

    private func reschedule() {
        guard settings.notificationsEnabled else { return }
        NotificationScheduler.scheduleNotifications(for: settings)
    }

    private func formatDuration(_ minutes: Int) -> String {
        let h = minutes / 60
        let m = minutes % 60
        return m > 0 ? "\(h)h \(m)m" : "\(h)h"
    }
}

#Preview {
    SettingsView()
        .environmentObject(AppSettings.shared)
        .preferredColorScheme(.dark)
}
