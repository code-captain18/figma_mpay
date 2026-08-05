import { useAuth } from '@/store/auth.store';
import { useCallback, useState } from 'react';

export function useProfileForms() {
  const { user, updateUser } = useAuth();

  const [editForm, setEditForm] = useState({
    accountName: "John's Business",
    companyName: 'JM Enterprises Ltd',
    firstName: user?.name?.split(' ')[0] ?? '',
    lastName: user?.name?.split(' ')[1] ?? '',
    phoneNumber: user?.phone ?? '',
    email: user?.email ?? user?.username ?? '',
    address: '123 Independence Ave, Accra',
    ghanaCardNumber: 'GHA-123456789-0',
    taxId: 'TIN987654321',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editDone, setEditDone] = useState(false);

  const [oldPwd, setOldPwd] = useState('');
  const [oldPwdVerified, setOldPwdVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [oldPwdError, setOldPwdError] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdDone, setPwdDone] = useState(false);

  const saveProfile = useCallback(async () => {
    setEditSaving(true);
    await updateUser({
      name: `${editForm.firstName} ${editForm.lastName}`,
      phone: editForm.phoneNumber,
      email: editForm.email,
    });
    setEditSaving(false);
    setEditDone(true);
    setTimeout(() => setEditDone(false), 2000);
  }, [editForm, updateUser]);

  const resetPwd = useCallback(() => {
    setOldPwd(''); setOldPwdVerified(false); setOldPwdError('');
    setNewPwd(''); setConfirmPwd(''); setPwdDone(false);
    setShowOld(false); setShowNew(false); setShowConf(false);
  }, []);

  return {
    editForm, setEditForm, editSaving, editDone, saveProfile,
    oldPwd, setOldPwd,
    oldPwdVerified, setOldPwdVerified,
    verifying, setVerifying,
    oldPwdError, setOldPwdError,
    newPwd, setNewPwd,
    confirmPwd, setConfirmPwd,
    showOld, setShowOld,
    showNew, setShowNew,
    showConf, setShowConf,
    pwdSaving, setPwdSaving,
    pwdDone, setPwdDone,
    resetPwd,
  };
}
