/**
 * BullMQ queue name constants.
 * Used by both the producer (NotificationsService) and the processor
 * (NotificationsProcessor) to ensure they reference the same queue.
 */
export declare const QUEUES: {
    readonly NOTIFICATIONS: "notifications";
};
/**
 * Job name constants within the notifications queue.
 * Each represents a distinct notification event type.
 */
export declare const NOTIFICATION_JOBS: {
    readonly SEND_IN_APP: "send-in-app";
    readonly SEND_EMAIL: "send-email";
    readonly SEND_SMS: "send-sms";
};
