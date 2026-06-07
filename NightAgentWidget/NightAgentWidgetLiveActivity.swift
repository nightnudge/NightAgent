//
//  NightAgentWidgetLiveActivity.swift
//  NightAgentWidget
//
//  Created by Milan Privat on 07.06.26.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct NightAgentWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct NightAgentWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NightAgentWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension NightAgentWidgetAttributes {
    fileprivate static var preview: NightAgentWidgetAttributes {
        NightAgentWidgetAttributes(name: "World")
    }
}

extension NightAgentWidgetAttributes.ContentState {
    fileprivate static var smiley: NightAgentWidgetAttributes.ContentState {
        NightAgentWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: NightAgentWidgetAttributes.ContentState {
         NightAgentWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: NightAgentWidgetAttributes.preview) {
   NightAgentWidgetLiveActivity()
} contentStates: {
    NightAgentWidgetAttributes.ContentState.smiley
    NightAgentWidgetAttributes.ContentState.starEyes
}
