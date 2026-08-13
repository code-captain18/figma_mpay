export interface ContactPhoneNumber {
  label: string;
  number: string;
  raw: string;
}

export interface NormalizedContact {
  id: string;
  name: string;
  phoneNumbers: ContactPhoneNumber[];
}

export type ContactPermissionStatus = 'undetermined' | 'granted' | 'denied';
