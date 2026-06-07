// NightAgent – Onboarding
import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var settings: AppSettings
    @State private var page = 0
    @State private var notificationGranted = false

    private let totalPages = 6

    var body: some View {
        ZStack {
            Color.nightBgPrimary.ignoresSafeArea()
            VStack(spacing: 0) {
                pageIndicator
                    .padding(.top, 64)
                    .padding(.bottom, 8)

                TabView(selection: $page) {
                    welcomePage.tag(0)
                    sleepTimePage.tag(1)
                    wakeTimePage.tag(2)
                    annoyancePage.tag(3)
                    factModePage.tag(4)
                    notificationPage.tag(5)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))

                nextButton
                    .padding(.horizontal, 28)
                    .padding(.bottom, 44)
                    .padding(.top, 12)
            }
        }
        .preferredColorScheme(.dark)
    }

    // MARK: - Seite 1: Willkommen

    private var welcomePage: some View {
        VStack(spacing: 28) {
            Spacer()
            Image(systemName: "moon.stars.fill")
                .font(.system(size: 72))
                .foregroundStyle(Color.nightAccentGlow)

            Text("Willkommen bei\nNightAgent")
                .font(.system(.largeTitle, design: .rounded, weight: .semibold))
                .foregroundStyle(Color.nightTextPrimary)
                .multilineTextAlignment(.center)

            Text("Du wirst dabei unterstützt, abends rechtzeitig das Handy wegzulegen.\nKein Zwang – aber ein guter Begleiter, der dich erinnert.")
                .font(.system(.callout, design: .rounded))
                .foregroundStyle(Color.nightTextSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 12)
            Spacer()
        }
        .padding(.horizontal, 32)
    }

    // MARK: - Seite 2: Schlafzeit

    private var sleepTimePage: some View {
        VStack(spacing: 28) {
            Spacer()
            pageHeader(icon: "moon.fill", title: "Wann willst du schlafen?")

            DatePicker("", selection: $settings.sleepTime, displayedComponents: .hourAndMinute)
                .datePickerStyle(.wheel)
                .labelsHidden()
                .colorScheme(.dark)
                .frame(maxWidth: 240)

            Text("Ziel-Schlafenszeit")
                .font(.system(.caption, design: .rounded))
                .foregroundStyle(Color.nightTextSecondary)
            Spacer()
        }
        .padding(.horizontal, 32)
    }

    // MARK: - Seite 3: Aufstehzeit

    private var wakeTimePage: some View {
        VStack(spacing: 28) {
            Spacer()
            pageHeader(icon: "sun.horizon.fill", title: "Wann stehst du auf?")

            DatePicker("", selection: $settings.wakeTime, displayedComponents: .hourAndMinute)
                .datePickerStyle(.wheel)
                .labelsHidden()
                .colorScheme(.dark)
                .frame(maxWidth: 240)

            let h = settings.sleepDurationMinutes / 60
            let m = settings.sleepDurationMinutes % 60
            Text(m > 0 ? "Das sind \(h)h \(m)m Schlaf" : "Das sind \(h)h Schlaf")
                .font(.system(.callout, design: .rounded))
                .foregroundStyle(Color.nightTextSecondary)
            Spacer()
        }
        .padding(.horizontal, 32)
    }

    // MARK: - Seite 4: Nervfaktor

    private var annoyancePage: some View {
        VStack(spacing: 20) {
            Spacer()
            pageHeader(icon: "bell.badge.fill", title: "Wie hartnäckig darf ich sein?")

            VStack(spacing: 10) {
                selectionRow(
                    title: "Sanft",
                    subtitle: "Nur normale Erinnerungen",
                    selected: settings.annoyanceLevel == 0
                ) { settings.annoyanceLevel = 0 }

                selectionRow(
                    title: "Normal",
                    subtitle: "Erinnerungen + Hinweis bei Überschreitung",
                    selected: settings.annoyanceLevel == 1
                ) { settings.annoyanceLevel = 1 }

                selectionRow(
                    title: "Streng",
                    subtitle: "Zusätzliche Follow-up Notifications",
                    selected: settings.annoyanceLevel == 2
                ) { settings.annoyanceLevel = 2 }

                selectionRow(
                    title: "Sehr streng",
                    subtitle: "Follow-ups + Bestätigungs-Screen in App",
                    selected: settings.annoyanceLevel == 3
                ) { settings.annoyanceLevel = 3 }
            }
            Spacer()
        }
        .padding(.horizontal, 28)
    }

    // MARK: - Seite 5: Faktenmodus

    private var factModePage: some View {
        VStack(spacing: 20) {
            Spacer()
            pageHeader(icon: "brain.head.profile", title: "Welche Fakten motivieren dich?")

            VStack(spacing: 10) {
                selectionRow(
                    title: "Positiv",
                    subtitle: "Was guter Schlaf dir bringt",
                    selected: settings.factMode == 0
                ) { settings.factMode = 0 }

                selectionRow(
                    title: "Positiv + Direkt",
                    subtitle: "Vorteile und Nachteile von Schlafmangel",
                    selected: settings.factMode == 1
                ) { settings.factMode = 1 }
            }
            Spacer()
        }
        .padding(.horizontal, 28)
    }

    // MARK: - Seite 6: Notifications

    private var notificationPage: some View {
        VStack(spacing: 24) {
            Spacer()
            pageHeader(icon: "bell.fill", title: "Darf ich dich erinnern?")

            Text("NightAgent kann dich automatisch erinnern, rechtzeitig das Handy wegzulegen. Dafür brauchen wir deine Erlaubnis.")
                .font(.system(.callout, design: .rounded))
                .foregroundStyle(Color.nightTextSecondary)
                .multilineTextAlignment(.center)

            if notificationGranted || settings.notificationsEnabled {
                Label("Notifications erlaubt", systemImage: "checkmark.circle.fill")
                    .font(.system(.callout, design: .rounded, weight: .medium))
                    .foregroundStyle(Color.nightStatusGreen)
                    .padding(.top, 4)
            } else {
                VStack(spacing: 12) {
                    Button("Notifications erlauben") {
                        Task {
                            let granted = await NotificationScheduler.requestPermission()
                            notificationGranted = granted
                            settings.notificationsEnabled = granted
                            if granted {
                                NotificationScheduler.scheduleNotifications(for: settings)
                            }
                        }
                    }
                    .font(.system(.body, design: .rounded, weight: .semibold))
                    .foregroundStyle(Color.nightBgPrimary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.nightAccentGlow)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .buttonStyle(.plain)

                    Button("Jetzt nicht") {
                        settings.notificationsEnabled = false
                    }
                    .font(.system(.callout, design: .rounded))
                    .foregroundStyle(Color.nightTextSecondary)
                }
            }
            Spacer()
        }
        .padding(.horizontal, 28)
    }

    // MARK: - Wiederverwendbare Komponenten

    private func pageHeader(icon: String, title: String) -> some View {
        VStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 52))
                .foregroundStyle(Color.nightAccentGlow)

            Text(title)
                .font(.system(.title2, design: .rounded, weight: .semibold))
                .foregroundStyle(Color.nightTextPrimary)
                .multilineTextAlignment(.center)
        }
    }

    private func selectionRow(title: String, subtitle: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(.system(.body, design: .rounded, weight: .medium))
                        .foregroundStyle(Color.nightTextPrimary)
                    Text(subtitle)
                        .font(.system(.caption, design: .rounded))
                        .foregroundStyle(Color.nightTextSecondary)
                }
                Spacer()
                Image(systemName: selected ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(selected ? Color.nightAccentGlow : Color.nightTextSecondary.opacity(0.4))
                    .font(.system(size: 20))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                selected ? Color.nightAccent.opacity(0.5) : Color.nightBgSecondary.opacity(0.5)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(selected ? Color.nightAccentGlow.opacity(0.4) : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Navigation

    private var pageIndicator: some View {
        HStack(spacing: 7) {
            ForEach(0..<totalPages, id: \.self) { i in
                Capsule()
                    .fill(i == page ? Color.nightAccentGlow : Color.nightTextSecondary.opacity(0.25))
                    .frame(width: i == page ? 20 : 7, height: 7)
                    .animation(.spring(response: 0.3), value: page)
            }
        }
    }

    private var nextButton: some View {
        Button {
            if page < totalPages - 1 {
                withAnimation(.easeInOut(duration: 0.25)) { page += 1 }
            } else {
                settings.onboardingDone = true
            }
        } label: {
            Text(page == totalPages - 1 ? "Los geht's 🌙" : "Weiter")
                .font(.system(.body, design: .rounded, weight: .semibold))
                .foregroundStyle(Color.nightBgPrimary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.nightAccentGlow)
                .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    OnboardingView()
        .environmentObject(AppSettings.shared)
}
