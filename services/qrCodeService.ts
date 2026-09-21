import QRCode from 'qrcode';

export const qrCodeService = {
  async toDataUrl(text: string) {
    return QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      scale: 4,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });
  },
};
