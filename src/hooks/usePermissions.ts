/**
 * usePermissions hook — manages runtime permissions.
 */
import { useState, useCallback } from 'react';
import { permissionManager } from '../services/mobile';
import type { PermissionStatus } from '../services/mobile';

export function usePermissions() {
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('undetermined');
  const [micStatus, setMicStatus] = useState<PermissionStatus>('undetermined');
  const [notifStatus, setNotifStatus] = useState<PermissionStatus>('undetermined');

  const requestCamera = useCallback(async () => {
    const result = await permissionManager.requestCamera();
    setCameraStatus(result.status);
    return result;
  }, []);

  const requestMicrophone = useCallback(async () => {
    const result = await permissionManager.requestMicrophone();
    setMicStatus(result.status);
    return result;
  }, []);

  const requestNotifications = useCallback(async () => {
    const result = await permissionManager.requestNotifications();
    setNotifStatus(result.status);
    return result;
  }, []);

  const checkAll = useCallback(async () => {
    const [cam, mic, notif] = await Promise.all([
      permissionManager.checkCamera(),
      permissionManager.checkMicrophone(),
      permissionManager.checkNotifications(),
    ]);
    setCameraStatus(cam);
    setMicStatus(mic);
    setNotifStatus(notif);
  }, []);

  return {
    cameraStatus,
    micStatus,
    notifStatus,
    requestCamera,
    requestMicrophone,
    requestNotifications,
    checkAll,
  };
}
