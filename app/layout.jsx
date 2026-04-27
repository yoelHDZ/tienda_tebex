import "@mantine/carousel/styles.css";
import { Box, ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import ThemeHotkey from "../components/ThemeHotkey";
import { BasketProvider } from "../contexts/BasketContext";
import { GamemodeProvider } from "../contexts/GamemodeContext";
import { UserProvider } from '../contexts/UserContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { getPublicSettings, getSettings, settings } from "../utils/settings";
import { theme } from "../theme/theme";
import "../theme/theme.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import DemoPopup from "../components/DemoPopup";
import TebexTokenRequiredPopup from "../components/TebexTokenRequiredPopup";

export const metadata = {
  title: settings.server_name,
  description: "Welcome to " + settings.server_name + " Minecraft server.",
};

export const dynamicParams = false;
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const hasTebexToken = Boolean(process.env.NEXT_PUBLIC_TEBEX_TOKEN?.trim());
  const liveSettings = getSettings();
  const publicSettings = getPublicSettings();
  const themeColors = liveSettings.theme?.colors || {};
  const themeVariables = {
    "--app-primary-color": themeColors.primary_color || "#0FF0EB",
    "--app-primary-contrast-color": themeColors.primary_contrast_color || "#000000",
    "--app-light-background-color": themeColors.light_background_color || "#FFFFFF",
    "--app-dark-background-color": themeColors.dark_background_color || "#282C42",
    "--app-light-surface-color": themeColors.light_surface_color || "#EBEBEB",
    "--app-dark-surface-color": themeColors.dark_surface_color || "#1C1F30",
    "--app-light-surface-border-color": themeColors.light_surface_border_color || "#E0E0E0",
    "--app-dark-surface-border-color": themeColors.dark_surface_border_color || "#333750",
    "--app-light-shadow-color": themeColors.light_shadow_color || "#C0C0C0",
    "--app-dark-shadow-color": themeColors.dark_shadow_color || "#242946",
    "--app-light-input-color": themeColors.light_input_color || "#D8D8D8",
    "--app-dark-input-color": themeColors.dark_input_color || "#103C4E",
    "--app-snow-color": themeColors.snow_color || "#FFFFFF",
    "--app-dark-disabled-input-color": themeColors.dark_input_color || "#103C4E",
    "--app-dark-disabled-shadow-color": themeColors.dark_shadow_color || "#242946",
    "--app-light-progress-track-color": themeColors.light_surface_color || "#EBEBEB",
    "--app-dark-progress-track-color": themeColors.dark_surface_color || "#1C1F30",
    "--app-light-footer-color": themeColors.light_surface_color || "#EBEBEB",
    "--app-dark-footer-color": themeColors.dark_surface_color || "#1C1F30",
    "--app-neutral-white": themeColors.neutral_white || "#FFFFFF",
    "--app-neutral-black": themeColors.neutral_black || "#000000",
    "--app-neutral-gray-333": themeColors.neutral_gray_333 || "#333333",
    "--app-notification-error-color": themeColors.notification_error_color || "#EB525C",
    "--app-notification-error-shadow-color": themeColors.notification_error_shadow_color || "#6E252A",
    "--app-overlay-light-60-color": themeColors.overlay_light_60_color || "rgba(255, 255, 255, 0.6)",
    "--app-overlay-dark-60-color": themeColors.overlay_dark_60_color || "rgba(35, 35, 61, 0.6)",
    "--app-overlay-light-border-color": themeColors.overlay_light_border_color || "rgba(200, 200, 200, 0.18)",
    "--app-overlay-dark-border-color": themeColors.overlay_dark_border_color || "rgba(255, 255, 255, 0.08)",
    "--app-hero-overlay-light-start-color": themeColors.hero_overlay_light_start_color || "rgba(255, 255, 255, 0.2)",
    "--app-hero-overlay-light-end-color": themeColors.hero_overlay_light_end_color || "#FFFFFF",
    "--app-hero-overlay-dark-start-color": themeColors.hero_overlay_dark_start_color || "rgba(40, 44, 66, 0.2)",
    "--app-hero-overlay-dark-end-color": themeColors.hero_overlay_dark_end_color || "#282C42",
    "--app-notification-close-hover-color": themeColors.notification_close_hover_color || "rgba(0, 0, 0, 0.2)",
    "--app-admin-sidebar-hover-color": themeColors.admin_sidebar_hover_color || "rgba(26, 152, 206, 0.12)",
    "--app-admin-sidebar-active-color": themeColors.admin_sidebar_active_color || "rgba(26, 152, 206, 0.2)",
    "--app-page-overlay-light-start-color": themeColors.page_overlay_light_start_color || "rgba(255, 255, 255, 0.1)",
    "--app-page-overlay-dark-start-color": themeColors.page_overlay_dark_start_color || "rgba(10, 10, 10, 0.35)",
    "--app-admin-radio-checked-light-color": themeColors.admin_radio_checked_light_color || "rgba(34, 139, 230, 0.06)",
    "--app-admin-radio-checked-dark-color": themeColors.admin_radio_checked_dark_color || "rgba(34, 139, 230, 0.08)",
    "--app-gamemode-trigger-light-color": themeColors.gamemode_trigger_light_color || "#E0E0E0",
    "--app-gamemode-trigger-dark-color": themeColors.gamemode_trigger_dark_color || "#252840",
    "--app-gamemode-trigger-hover-light-color": themeColors.gamemode_trigger_hover_light_color || "#D4D4D4",
    "--app-gamemode-trigger-hover-dark-color": themeColors.gamemode_trigger_hover_dark_color || "#2D3050",
    "--app-gamemode-dropdown-light-color": themeColors.gamemode_dropdown_light_color || "#EBEBEB",
    "--app-gamemode-dropdown-dark-color": themeColors.gamemode_dropdown_dark_color || "#1C1F30",
    "--app-gamemode-dropdown-border-light-color": themeColors.gamemode_dropdown_border_light_color || "#D4D4D4",
    "--app-gamemode-dropdown-border-dark-color": themeColors.gamemode_dropdown_border_dark_color || "#333750",
    "--app-gamemode-dropdown-shadow-color": themeColors.gamemode_dropdown_shadow_color || "rgba(0, 0, 0, 0.3)",
    "--app-gamemode-option-hover-light-color": themeColors.gamemode_option_hover_light_color || "#D8D8D8",
    "--app-gamemode-option-hover-dark-color": themeColors.gamemode_option_hover_dark_color || "#282B42",
    "--app-gamemode-option-active-light-color": themeColors.gamemode_option_active_light_color || "#D0D0D0",
    "--app-gamemode-option-active-dark-color": themeColors.gamemode_option_active_dark_color || "#2A2D48",
    "--mantine-color-primary-5": themeColors.primary_color || "#0FF0EB",
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/js/all.min.js" crossOrigin="anonymous" referrerPolicy="no-referrer"></script>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body suppressHydrationWarning style={themeVariables}>
        <NextIntlClientProvider messages={messages}>
          {liveSettings.theme.enable_snow && <div className="snowflakes">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="snowflake">
                <div className="inner">❅</div>
              </div>
            ))}
          </div>}

          <MantineProvider defaultColorScheme="dark" theme={theme}>
            <SettingsProvider initialSettings={publicSettings}>
              <GamemodeProvider>
                <UserProvider>
                  <BasketProvider>
                    <ModalsProvider>
                      <ThemeHotkey />
                      <Notifications position="bottom-center" />
                      <DemoPopup />
                      {!hasTebexToken && <TebexTokenRequiredPopup />}
                      {children}
                    </ModalsProvider>
                  </BasketProvider>
                </UserProvider>
              </GamemodeProvider>
            </SettingsProvider>
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
