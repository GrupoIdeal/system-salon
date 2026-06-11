import "expo-notifications";

declare module "expo-notifications" {
  export function removeNotificationSubscription(
    subscription: EventSubscription
  ): void;
}
