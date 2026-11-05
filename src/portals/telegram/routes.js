import { TELEGRAM_ENABLED } from "../../shared/config/featureFlags";
import TelegramNew from "./new/TelegramNew";
import SDLTelegramDashboard from "./pages/Dashboard";
import SDLTelegramGroups from "./pages/Groups";
import SDLTelegramMembers from "./pages/Members";

// Telegram is only registered when the feature flag is on.
export const telegramRoutes = TELEGRAM_ENABLED
  ? [
      { path: "telegram-new/", element: TelegramNew },
      { path: "telegram-new/:view", element: TelegramNew },
      { path: "telegram/", element: SDLTelegramDashboard },
      { path: "telegram/groups", element: SDLTelegramGroups },
      { path: "telegram/members", element: SDLTelegramMembers },
    ]
  : [];
