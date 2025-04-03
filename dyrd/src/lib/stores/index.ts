// Import and re-export with namespaces to avoid naming conflicts
import * as authStoreExports from './authStore';
import * as customerStoreExports from './customerStore';
import * as jobStoreExports from './jobStore';
import * as laborStoreExports from './laborStore';
import * as logEntryStoreExports from './logEntryStore';
import * as notificationStoreExports from './notificationStore';
import * as quoteStoreExports from './quoteStore';
import * as userStoreExports from './userStore';
import * as truckStoreExports from './truckStore';
import * as scheduleStoreExports from './scheduleStore';

// Export namespaced modules
export const authStore = authStoreExports;
export const customerStore = customerStoreExports;
export const jobStore = jobStoreExports;
export const laborStore = laborStoreExports;
export const logEntryStore = logEntryStoreExports;
export const notificationStore = notificationStoreExports;
export const quoteStore = quoteStoreExports;
export const userStore = userStoreExports;
export const truckStore = truckStoreExports;
export const scheduleStore = scheduleStoreExports; 