import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '../ui/Button';
import { X, Upload, Check } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUploadComplete: (imageUrl: string) => void;
  onCancel: () => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onUploadComplete,
  onCancel
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    setCrop({
      unit: 'px',
      width: size,
      height: size,
      x,
      y
    });
  }, []);

  const getCroppedImg = useCallback(
    async (image: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = 400;
      canvas.height = 400;

      ctx.drawImage(
        image,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        400,
        400
      );

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            }
          },
          'image/jpeg',
          0.95
        );
      });
    },
    []
  );

  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current) return;

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });

      const reader = new FileReader();
      reader.onloadend = () => {
        onUploadComplete(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Upload Profile Picture</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!imgSrc ? (
            <div>
              <label className="block border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-slate-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2 font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-500">PNG, JPG up to 10MB</p>
                <p className="text-xs text-slate-400 mt-2">Image will be cropped to 1:1 aspect ratio</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="max-h-96"
                  />
                </ReactCrop>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImgSrc('')}
                  className="flex-1"
                >
                  Choose Different Image
                </Button>
                <Button
                  type="button"
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!completedCrop}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Crop & Upload
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
