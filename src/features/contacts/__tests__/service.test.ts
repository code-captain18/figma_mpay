import {
  getContactPermissionStatus,
  loadContacts,
  requestContactPermission,
} from '../service';

const mockGetPermissions = jest.fn();
const mockRequestPermissions = jest.fn();
const mockGetContacts = jest.fn();

jest.mock('expo-contacts', () => ({
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  ContactField: { FULL_NAME: 'fullName', PHONES: 'phones' },
  ContactsSortOrder: { GivenName: 'givenName' },
  getPermissionsAsync: (...args: any[]) => mockGetPermissions(...args),
  requestPermissionsAsync: (...args: any[]) => mockRequestPermissions(...args),
  Contact: { getAllDetails: (...args: any[]) => mockGetContacts(...args) },
}));

describe('getContactPermissionStatus', () => {
  test('returns granted', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'granted' });
    expect(await getContactPermissionStatus()).toBe('granted');
  });

  test('returns denied', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'denied' });
    expect(await getContactPermissionStatus()).toBe('denied');
  });

  test('returns undetermined', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    expect(await getContactPermissionStatus()).toBe('undetermined');
  });
});

describe('requestContactPermission', () => {
  test('returns granted when user approves', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    expect(await requestContactPermission()).toBe('granted');
  });

  test('returns denied when user denies', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });
    expect(await requestContactPermission()).toBe('denied');
  });
});

describe('loadContacts', () => {
  beforeEach(() => {
    mockGetContacts.mockResolvedValue([
      {
        id: '1',
        fullName: 'John Mensah',
        phones: [{ number: '0241234567', label: 'mobile' }],
      },
      {
        id: '2',
        fullName: 'Ama Boateng',
        phones: [
          { number: '+233201234567', label: 'mobile' },
          { number: '030 123 4567', label: 'home' },
        ],
      },
      {
        id: '3',
        fullName: 'No Phone',
        phones: [],
      },
      {
        id: '4',
        fullName: 'Bad Number',
        phones: [{ number: '+1 650 555 0100', label: 'mobile' }],
      },
    ]);
  });

  test('returns normalized contacts with valid numbers', async () => {
    const contacts = await loadContacts();
    expect(contacts).toHaveLength(2);
  });

  test('normalizes international format', async () => {
    const contacts = await loadContacts();
    const ama = contacts.find(c => c.name === 'Ama Boateng');
    expect(ama?.phoneNumbers[0].number).toBe('0201234567');
  });

  test('filters out contacts with no valid numbers', async () => {
    const contacts = await loadContacts();
    expect(contacts.find(c => c.name === 'No Phone')).toBeUndefined();
    expect(contacts.find(c => c.name === 'Bad Number')).toBeUndefined();
  });

  test('keeps multiple valid numbers per contact', async () => {
    const contacts = await loadContacts();
    const ama = contacts.find(c => c.name === 'Ama Boateng');
    expect(ama?.phoneNumbers.length).toBeGreaterThanOrEqual(1);
  });
});
