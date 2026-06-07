// NightAgent – Home Screen
import SwiftUI
import Combine

// MARK: - Root

struct ContentView: View {
    @EnvironmentObject var settings: AppSettings
    @Environment(\.scenePhase) private var scenePhase
    @State private var showSettings = false
    @State private var showBedtimeScreen = false

    var body: some View {
        ZStack {
            background
            if settings.onboardingDone {
                HomeView(showSettings: $showSettings)
                    .transition(.opacity)
            } else {
                OnboardingView()
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.4), value: settings.onboardingDone)
        .sheet(isPresented: $showSettings) {
            SettingsView()
        }
        // Bestätigungs-Screen für Sehr streng
        .fullScreenCover(isPresented: $showBedtimeScreen) {
            BedtimeConfirmationView()
        }
        .onAppear { checkBedtimeAlert() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { checkBedtimeAlert() }
        }
    }

    // Zeigt Bestätigungs-Screen wenn: Sehr streng + nach Schlafenszeit + nicht bestätigt
    private func checkBedtimeAlert() {
        guard settings.onboardingDone,
              settings.annoyanceLevel == 3,
              !settings.todayConfirmed else { return }
        if isPastBedtime() { showBedtimeScreen = true }
    }

    private func isPastBedtime() -> Bool {
        let cal  = Calendar.current
        let now  = Date()
        let nowM = cal.component(.hour, from: now)    * 60 + cal.component(.minute, from: now)
        let slpM = cal.component(.hour, from: settings.sleepTime) * 60
                 + cal.component(.minute, from: settings.sleepTime)
        let diff = slpM - nowM
        // diff < 0  → Schlafzeit liegt in der Vergangenheit (heute)
        // diff > 12h → Schlafzeit ist weit in der Zukunft (also gestern überschritten)
        return diff < 0 || diff > 12 * 60
    }

    private var background: some View {
        ZStack {
            Color.nightBgPrimary.ignoresSafeArea()
            RadialGradient(
                colors: [Color.nightAccentGlow.opacity(0.10), .clear],
                center: .top,
                startRadius: 0,
                endRadius: 420
            )
            .ignoresSafeArea()
        }
    }
}

// MARK: - Home View

struct HomeView: View {
    @EnvironmentObject var settings: AppSettings
    @Binding var showSettings: Bool

    @State private var now = Date.now
    private let ticker = Timer.publish(every: 60, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 0) {
            navBar
            Spacer()
            countdownCard
            Spacer()
            confirmButton
                .padding(.horizontal, 28)
                .padding(.bottom, 16)
            timeRow
                .padding(.horizontal, 28)
                .padding(.bottom, 44)
        }
        .onReceive(ticker) { _ in now = .now }
    }

    // MARK: Nav

    private var navBar: some View {
        HStack {
            Text("NightAgent")
                .font(.system(.title2, design: .rounded, weight: .semibold))
                .foregroundStyle(Color.nightTextPrimary)
            Spacer()
            Button { showSettings = true } label: {
                Image(systemName: "gearshape")
                    .font(.system(size: 22, weight: .light))
                    .foregroundStyle(Color.nightTextSecondary)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 28)
        .padding(.top, 20)
    }

    // MARK: Countdown

    private var countdownCard: some View {
        let (label, time, sub) = countdownContent
        return VStack(spacing: 14) {
            Text(label)
                .font(.system(.subheadline, design: .rounded))
                .foregroundStyle(Color.nightTextSecondary)
                .textCase(.uppercase)
                .tracking(2)
            Text(time)
                .font(.system(size: 64, weight: .thin, design: .rounded))
                .foregroundStyle(Color.nightTextPrimary)
                .monospacedDigit()
                .contentTransition(.numericText())
            Text(sub)
                .font(.system(.callout, design: .rounded))
                .foregroundStyle(Color.nightTextSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .background(Color.nightBgSecondary.opacity(0.6))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .padding(.horizontal, 24)
    }

    private var countdownContent: (String, String, String) {
        let toSleep = minutesUntil(settings.sleepTime)
        if isPastBedtime(toSleep) {
            let toWake = minutesUntil(settings.wakeTime)
            return ("Du hast noch", formatDuration(toWake), "Leg das Handy weg – jede Minute zählt.")
        }
        return ("Bis zur Schlafzeit", formatDuration(toSleep), clockString(settings.sleepTime))
    }

    // MARK: Bestätigung

    private var confirmButton: some View {
        Button {
            settings.confirmToday()
            NotificationScheduler.cancelFollowUps()   // Follow-ups löschen
        } label: {
            HStack(spacing: 10) {
                Image(systemName: settings.todayConfirmed ? "checkmark.circle.fill" : "moon.fill")
                Text(settings.todayConfirmed ? "Heute bestätigt" : "Für heute bestätigen")
            }
            .font(.system(.body, design: .rounded, weight: .medium))
            .foregroundStyle(settings.todayConfirmed ? Color.nightStatusGreen : Color.nightTextPrimary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(
                settings.todayConfirmed
                    ? Color.nightStatusGreen.opacity(0.15)
                    : Color.nightBgSecondary.opacity(0.6)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
        .disabled(settings.todayConfirmed)
    }

    // MARK: Zeitanzeige

    private var timeRow: some View {
        HStack {
            timeCell(icon: "moon.fill",        label: "Schlaf",  time: settings.sleepTime)
            Spacer()
            Image(systemName: "arrow.right")
                .font(.footnote)
                .foregroundStyle(Color.nightTextSecondary.opacity(0.35))
            Spacer()
            timeCell(icon: "sun.horizon.fill",  label: "Aufwach", time: settings.wakeTime)
        }
    }

    private func timeCell(icon: String, label: String, time: Date) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Color.nightTextSecondary)
            Text(clockString(time))
                .font(.system(.title2, design: .rounded, weight: .medium))
                .foregroundStyle(Color.nightTextPrimary)
            Text(label)
                .font(.system(.caption2, design: .rounded))
                .foregroundStyle(Color.nightTextSecondary)
                .textCase(.uppercase)
                .tracking(1)
        }
    }

    // MARK: Hilfsfunktionen

    private func minutesUntil(_ target: Date) -> Int {
        let cal  = Calendar.current
        let nowM = cal.component(.hour, from: now)    * 60 + cal.component(.minute, from: now)
        let tgtM = cal.component(.hour, from: target) * 60 + cal.component(.minute, from: target)
        let diff = tgtM - nowM
        return diff > 0 ? diff : diff + 24 * 60
    }

    private func isPastBedtime(_ minutesToSleep: Int) -> Bool {
        minutesToSleep > 12 * 60
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

// MARK: - Bestätigungs-Screen (Sehr streng, nach Schlafenszeit)

struct BedtimeConfirmationView: View {
    @EnvironmentObject var settings: AppSettings
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            Color.nightBgPrimary.ignoresSafeArea()
            VStack(spacing: 0) {
                Spacer()

                Image(systemName: "moon.zzz.fill")
                    .font(.system(size: 72))
                    .foregroundStyle(Color.nightAccentGlow)
                    .padding(.bottom, 28)

                Text("Es ist Schlafenszeit")
                    .font(.system(.title, design: .rounded, weight: .semibold))
                    .foregroundStyle(Color.nightTextPrimary)
                    .padding(.bottom, 12)

                Text("Du wolltest um \(clockString(settings.sleepTime)) schlafen.\nLeg das Handy jetzt weg.")
                    .font(.system(.callout, design: .rounded))
                    .foregroundStyle(Color.nightTextSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)

                Spacer()

                VStack(spacing: 14) {
                    Button("Handy weglegen ✓") {
                        settings.confirmToday()
                        NotificationScheduler.cancelFollowUps()
                        dismiss()
                    }
                    .font(.system(.body, design: .rounded, weight: .semibold))
                    .foregroundStyle(Color.nightBgPrimary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.nightAccentGlow)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .buttonStyle(.plain)

                    Button("Ich brauche noch etwas") { dismiss() }
                        .font(.system(.callout, design: .rounded))
                        .foregroundStyle(Color.nightTextSecondary)
                }
                .padding(.horizontal, 28)
                .padding(.bottom, 52)
            }
        }
        .preferredColorScheme(.dark)
    }

    private func clockString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "HH:mm"
        return f.string(from: date)
    }
}

#Preview("Home") {
    ContentView()
        .environmentObject(AppSettings.shared)
        .preferredColorScheme(.dark)
}
