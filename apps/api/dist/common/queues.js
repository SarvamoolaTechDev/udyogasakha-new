"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_JOBS = exports.QUEUES = void 0;
/**
 * BullMQ queue name constants.
 * Used by both the producer (NotificationsService) and the processor
 * (NotificationsProcessor) to ensure they reference the same queue.
 */
exports.QUEUES = {
    NOTIFICATIONS: 'notifications',
};
/**
 * Job name constants within the notifications queue.
 * Each represents a distinct notification event type.
 */
exports.NOTIFICATION_JOBS = {
    SEND_IN_APP: 'send-in-app',
    SEND_EMAIL: 'send-email', // stub — logs to console until SMTP is configured
    SEND_SMS: 'send-sms', // stub — logs to console until MSG91/Twilio is configured
};
//# sourceMappingURL=queues.js.map