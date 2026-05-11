const MIME_TYPE_MAP: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  csv: "text/csv",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  "7z": "application/x-7z-compressed",
  msg: "application/vnd.ms-outlook",
  eml: "message/rfc822"
};

export const getCorrectMimeType = (file: File): File => {
  if (!file.type || file.type === "application/octet-stream") {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const correctType = extension ? MIME_TYPE_MAP[extension] : file.type;

    if (correctType && correctType !== file.type) {
      return new File([file], file.name, { type: correctType });
    }
  }
  return file;
};
