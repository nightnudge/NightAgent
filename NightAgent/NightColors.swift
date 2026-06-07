// Created by Ben Maubach
// © 2026 Ben Maubach

import SwiftUI

extension Color {
    static let nightBgPrimary     = Color(hex: "0A1F0F")
    static let nightBgSecondary   = Color(hex: "122B17")
    static let nightAccent        = Color(hex: "1A4D2E")
    static let nightAccentGlow    = Color(hex: "2E7D4F")
    static let nightTextPrimary   = Color(hex: "E8F5E9")
    static let nightTextSecondary = Color(hex: "81C784")
    static let nightStatusGreen   = Color(hex: "4CAF50")
    static let nightStatusYellow  = Color(hex: "FFD54F")
    static let nightStatusRed     = Color(hex: "EF5350")
}

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
