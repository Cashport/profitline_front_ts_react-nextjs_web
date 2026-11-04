import { Dispatch, SetStateAction, useState } from "react";
import { Flex, Spin, Typography, Upload, UploadProps, message } from "antd";
import "./uploadimg.scss";
import Image from "next/image";
import { useTranslations } from "use-intl";
interface Props {
  imgDefault?: string;
  setImgFile: Dispatch<SetStateAction<any>>;
  disabled?: boolean;
}

export const UploadImg = ({ disabled = false, imgDefault = "", setImgFile }: Props) => {
  const t = useTranslations("components.uploadImg");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(imgDefault);

  // eslint-disable-next-line no-unused-vars
  const getBase64 = (img: any, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
    setImgFile(img);
  };
  // Validation for image, max size is 2mb
  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error(t("invalidType"));
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error(t("tooLarge"));
    return isJpgOrPng && isLt2M;
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as any, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const customRequest = ({ onSuccess, onProgress }: any) => {
    // Simula upload y se ocmpleta en medio segundo
    setTimeout(() => {
      onProgress({ percent: 100 });
      onSuccess("ok");
    }, 500);
  };
  return (
    <Flex vertical className="uploadimg">
      <Upload
        accept=".jpg,.jpeg,.png"
        name="avatar"
        listType="picture-card"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        disabled={disabled}
        customRequest={customRequest}
      >
        {loading && <Spin />}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={t("logoAlt")} className="img" />
        ) : (
          <Image src={"/images/watermark.svg"} alt={t("watermarkAlt")} width={48} height={48} />
        )}
      </Upload>
      <Typography.Text className="uploadText">{t("hint")}</Typography.Text>
    </Flex>
  );
};
