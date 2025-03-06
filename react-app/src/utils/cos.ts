import COS from "cos-js-sdk-v5";

// 腾讯云 COS 配置
const cos = new COS({
  SecretId: import.meta.env.VITE_TENCENT_COS_SECRET_ID, // ✅ 读取环境变量
  SecretKey: import.meta.env.VITE_TENCENT_COS_SECRET_KEY, // ✅ 读取环境变量
});

const BUCKET_NAME = import.meta.env.VITE_TENCENT_COS_BUCKET;
const REGION = import.meta.env.VITE_TENCENT_COS_REGION;
const FOLDER = "images"; // 存储文件的文件夹

// 获取日期
const getFilePath = (fileName: string) => {
  // 1. 获取当前日期
  const now = new Date();
  const year = now.getFullYear(); // 获取当前年份（如 2025）
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 获取月份（如 03）

  // 2. 生成存储路径（按年月分类）
  const filePath = `${FOLDER}/${year}/${month}/${fileName}`;
  return filePath;
};

// 生成带签名 URL，确保扩展名正确
export const getSignedUrl = async (
  fileKey: string,
  mimeType: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let filePath = getFilePath(fileKey);

    // 根据 MIME 类型确定扩展名
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    // 如果 fileKey 没有扩展名，自动添加
    if (!filePath.includes(".")) {
      const ext = mimeToExt[mimeType] || "webp"; // 默认为 webp
      filePath += `.${ext}`;
    }

    // ✅ 使用 callback 方式获取 URL
    cos.getObjectUrl(
      {
        Bucket: BUCKET_NAME,
        Region: REGION,
        Key: filePath,
        Sign: true,
        Expires: 3600, // 1小时有效
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Url); // ✅ 这里获取 URL
        }
      }
    );
  });
};

export const uploadFileToCOS = async (fileBlob: Blob, fileName: string) => {
  return new Promise((resolve, reject) => {
    const filePath = getFilePath(fileName);

    cos.putObject(
      {
        Bucket: BUCKET_NAME,
        Region: REGION,
        Key: filePath,
        Body: fileBlob,
        ContentType: fileBlob.type, // ✅ 明确指定 ContentType，防止压缩
        Headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          const fileUrl = `https://${data.Location}`;
          resolve(fileUrl);
        }
      }
    );
  });
};

export const convertBase64ToBlob = async (base64: string) => {
  const response = await fetch(base64);
  return await response.blob();
};

export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("图片转换 Base64 失败:", error);
    return "";
  }
};
