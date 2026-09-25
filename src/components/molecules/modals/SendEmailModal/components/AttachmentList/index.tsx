import { Button } from "antd";
import { X } from "phosphor-react";

interface AttachmentListProps {
  attachments: File[];
  shortenFileName: (name: string, maxLength: number) => string;
  handleRemoveFile: (file: File) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  shortenFileName,
  handleRemoveFile
}) => {
  if (attachments.length === 0) return null;

  return (
    <div>
      {attachments.map((file) => (
        <div
          key={file.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#F5F5F5",
            marginBottom: "8px"
          }}
        >
          {/* Nombre del archivo (enlace) */}
          <div>
            <a
              href={URL.createObjectURL(file)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#0085FF",
                textDecoration: "none",
                fontWeight: 600,
                flexGrow: 1
              }}
            >
              {shortenFileName(file.name, 15)}
            </a>
            <span style={{ color: "black", marginLeft: "8px" }}>
              ({(file.size / 1024).toFixed()} KB)
            </span>
          </div>
          <Button
            type="text"
            icon={<X size={16} />}
            onClick={() => handleRemoveFile(file)}
            style={{ marginLeft: "8px" }}
          />
        </div>
      ))}
    </div>
  );
};

export default AttachmentList;
