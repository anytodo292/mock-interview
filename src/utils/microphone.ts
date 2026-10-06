const VIRTUAL_DEFAULT_DEVICE_IDS = new Set(['default', 'communications']);

/**
 * Resolve Chrome's default input to its physical device ID when possible.
 * Chrome commonly exposes both a `default` alias and the underlying device,
 * linked by the same groupId.
 */
export async function getDefaultMicrophoneDeviceId(): Promise<string> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    throw new Error('Microphone devices cannot be listed in this browser.');
  }

  const microphones = (await navigator.mediaDevices.enumerateDevices()).filter(
    ({ kind }) => kind === 'audioinput',
  );

  if (microphones.length === 0) {
    throw new Error('No microphone was found.');
  }

  const defaultAlias = microphones.find(({ deviceId }) => deviceId === 'default');
  const physicalDefault = defaultAlias?.groupId
    ? microphones.find(
        ({ deviceId, groupId }) =>
          groupId === defaultAlias.groupId && !VIRTUAL_DEFAULT_DEVICE_IDS.has(deviceId),
      )
    : undefined;
  const firstPhysicalMicrophone = microphones.find(
    ({ deviceId }) => deviceId && !VIRTUAL_DEFAULT_DEVICE_IDS.has(deviceId),
  );
  const deviceId =
    physicalDefault?.deviceId ?? firstPhysicalMicrophone?.deviceId ?? defaultAlias?.deviceId;

  if (!deviceId) {
    throw new Error('The default microphone does not have an accessible device ID.');
  }

  return deviceId;
}

export function getMicrophoneStream(deviceId: string): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: { exact: deviceId },
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
}

/**
 * AgentMicrophone 0.1.1 does not accept deviceId. Limit the override to its
 * start call so its internal getUserMedia request receives the chosen device.
 */
export async function startAgentMicrophoneWithDevice(
  microphone: { start: () => Promise<void> },
  deviceId: string,
): Promise<void> {
  const mediaDevices = navigator.mediaDevices;
  const originalGetUserMedia = mediaDevices.getUserMedia;

  mediaDevices.getUserMedia = ((constraints?: MediaStreamConstraints) => {
    const audioConstraints =
      constraints?.audio && typeof constraints.audio === 'object' ? constraints.audio : {};

    return originalGetUserMedia.call(mediaDevices, {
      ...constraints,
      audio: {
        ...audioConstraints,
        deviceId: { exact: deviceId },
      },
    });
  }) as typeof mediaDevices.getUserMedia;

  try {
    await microphone.start();
  } finally {
    mediaDevices.getUserMedia = originalGetUserMedia;
  }
}
