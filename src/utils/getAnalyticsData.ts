import { Analytics } from "src/analytics/analytics.entity";
import { EngagementOverTime, LocationData, DeviceData } from "./genericSchema";

/**
 * aggregated analytics data returned by the getAnalyticsData function
 */
interface AnalyticsDataResponse {
    engagementOverTime: EngagementOverTime[];
    locations: LocationData[];
    deviceData: DeviceData[];
}


/**
 * Processes analytics data and aggregates engagement over time, location data, and device data.
 *
 * @param {Analytics[]} analytics - An array of analytics objects to be processed.
 * @returns {AnalyticsDataResponse} An object containing aggregated engagement data over time, locations, and device information.
*/
export const getAnalyticsData = (analytics: Analytics[]): AnalyticsDataResponse => {

    const { engagementOverTime, locations, deviceData } = analytics.reduce((acc, curr) => {
        // Engagement over time
        const date = new Date(curr.created_at).toDateString();
        const engagementIndex = acc.engagementOverTime.findIndex(item => item.date === date);
        if (engagementIndex !== -1) {
            acc.engagementOverTime[engagementIndex].clicks++;
        } else {
            acc.engagementOverTime.push({ date, clicks: 1 });
        }
    
        // Locations data
        if (curr.country || curr.city) {
            const locationIndex = acc.locations.findIndex(item => item.country === curr.country && item.city === curr.city);
            if (locationIndex !== -1) {
                acc.locations[locationIndex].clicks++;
            } else {
                acc.locations.push({ country: curr.country, city: curr.city, clicks: 1 });
            }
        }
    
        // Device data
        if(curr.device_type || curr.browser || curr.os) {
            const deviceIndex = acc.deviceData.findIndex(item => item.device_type === curr.device_type && item.browser === curr.browser && item.os === curr.os);
            if (deviceIndex !== -1) {
                acc.deviceData[deviceIndex].clicks++;
            } else {
                acc.deviceData.push({ device_type: curr.device_type, browser: curr.browser, os: curr.os, clicks: 1 });
            }
        }
    
        return acc;
    }, { engagementOverTime: [], locations: [], deviceData: [] });

    return {
        engagementOverTime,
        locations,
        deviceData
    }
}