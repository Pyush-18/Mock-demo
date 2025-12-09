
export const uploadToCloudinary = async (file, options = {}) => {
  const {
    folder = 'uploads',
    resourceType = 'auto',
    uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    onProgress = null,
  } = options;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured');
  }

  if (!uploadPreset) {
    throw new Error('Cloudinary upload preset is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  try {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    return new Promise((resolve, reject) => {
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            url: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            resourceType: response.resource_type,
            bytes: response.bytes,
            createdAt: response.created_at,
          });
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', url);
      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};


export const uploadCSVToCloudinary = async (csvFile, onProgress = null) => {
  return uploadToCloudinary(csvFile, {
    folder: 'csvFiles',
    resourceType: 'raw',
    onProgress,
  });
};


export const uploadImageToCloudinary = async (imageFile, onProgress = null) => {
  return uploadToCloudinary(imageFile, {
    folder: 'questionImages',
    resourceType: 'image',
    onProgress,
  });
};


export const uploadMultipleToCloudinary = async (files, options = {}) => {
  const uploadPromises = Array.from(files).map(file => 
    uploadToCloudinary(file, options)
  );
  
  return Promise.all(uploadPromises);
};