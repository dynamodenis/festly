/** Preview viewports. Widths are CSS pixels of common devices. */
export const DEVICES = {
  mobile: { label: "Phone", width: 390, height: 844 },
  tablet: { label: "Tablet", width: 820, height: 1180 },
  desktop: { label: "Desktop", width: 1440, height: 900 },
} as const

export type DeviceId = keyof typeof DEVICES
export const DEVICE_IDS = Object.keys(DEVICES) as Array<DeviceId>
