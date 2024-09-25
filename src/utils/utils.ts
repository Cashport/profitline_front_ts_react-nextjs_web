import { ISelectedProject } from "@/lib/slices/createProjectSlice";
import { IChanel } from "@/types/bre/IBRE";
import { ISelectStringType } from "@/types/communications/ICommunications";
import { CountryCode } from "@/types/global/IGlobal";
import dayjs from "dayjs";

interface Subline {
  id: number;
  description: string;
}

interface MyObject {
  idChannel: number;
  idLine: number;
  subline: Subline;
}
export function removeDuplicatesBySublineId(array: MyObject[]): MyObject[] {
  const uniqueMap = new Map<number, MyObject>();

  array.forEach((item) => {
    const sublineId = item.subline.id;
    if (!uniqueMap.has(sublineId)) {
      uniqueMap.set(sublineId, item);
    }
  });

  const uniqueArray: MyObject[] = Array.from(uniqueMap.values());

  return uniqueArray;
}
export function removeObjectsFromArray(
  originalArray: MyObject[],
  objectsToRemove: MyObject[]
): MyObject[] {
  const objectsToRemoveSet = new Set(objectsToRemove.map((obj) => JSON.stringify(obj)));

  const newArray = originalArray.filter((obj) => !objectsToRemoveSet.has(JSON.stringify(obj)));

  return newArray;
}
export function removeDuplicatesFromArrayNumbers(array: number[]): number[] {
  const uniqueSet = new Set(array);
  const uniqueArray = Array.from(uniqueSet);
  return uniqueArray;
}

export const filterBRbyIdSubline = (brs: any[], sublinesIds: number[]) => {
  if (sublinesIds?.length === 0) return;
  const filteredResults = brs.filter((channel) => {
    if (channel.CHANNEL_LINES) {
      // Filter channels with non-null CHANNEL_LINES
      channel.CHANNEL_LINES = channel.CHANNEL_LINES.filter((line: any) => {
        if (line.sublines?.length > 0) {
          // Filter lines with non-null sublines
          return line?.sublines?.some((subline: any) => sublinesIds?.includes(subline.id));
        }
        return false; // No sublines in this line
      });

      // Keep the channel only if it has lines after filtering
      return channel.CHANNEL_LINES.length > 0;
    }
    return false; // No CHANNEL_LINES in this channel
  });
  return filteredResults;
};

export const transformFormat = (original: any) => {
  const result = [] as any;

  original.forEach((channel: any) => {
    const idChannel = channel.CHANNEL_ID;

    if (channel.CHANNEL_LINES) {
      channel.CHANNEL_LINES.forEach((line: any) => {
        const idLine = line.id;

        if (line.sublines) {
          line.sublines.forEach((subline: any) => {
            const transformedObject = {
              idChannel,
              idLine,
              subline: {
                id: subline.id,
                description: subline.description
              }
            };
            result.push(transformedObject);
          });
        }
      });
    }
  });

  return result;
};

export const extractChannelLineSublines = (brs: IChanel[]) => {
  const extractedData = {
    channels: [] as { id: number; name: string }[],
    lines: [] as { id: number; name: string }[],
    sublines: [] as { id: number; name: string }[]
  };
  brs.forEach((channel) => {
    // Extract channel information
    const channelInfo = {
      id: channel.CHANNEL_ID,
      name: channel.CHANNEL_NAME
    };
    extractedData.channels.push(channelInfo);
    // Extract line information
    if (channel.CHANNEL_LINES) {
      channel.CHANNEL_LINES.forEach((line) => {
        const lineInfo = {
          id: line.id,
          name: line.description
        };
        extractedData.lines.push(lineInfo);

        // Extract subline information
        if (line.sublines) {
          line.sublines.forEach((subline) => {
            const sublineInfo = {
              id: subline.id,
              name: subline.description
            };
            extractedData.sublines.push(sublineInfo);
          });
        }
      });
    }
  });
  return extractedData;
};

export const docTypeIdBasedOnDocType = (documentType: string) => {
  switch (documentType) {
    case "NIT":
      return 1;
    case "Cedula":
      return 2;
    case "Pasaporte":
      return 3;
    case "Cedula de extranjeria":
      return 4;
    default:
      return 0;
  }
};

export function extractSingleParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const utcDay = String(date.getUTCDate()).padStart(2, "0");
  const utcMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const utcYear = date.getUTCFullYear();

  return `${utcDay}/${utcMonth}/${utcYear}`;
}
export const formatDateBars = (dateString: string): string => {
  const date = new Date(dateString);
  const utcDay = String(date.getUTCDate()).padStart(2, "0");
  const utcMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const utcYear = date.getUTCFullYear();
  return `${utcYear}-${utcMonth}-${utcDay}`;
};

export const formatDatePlane = (dateString: string): string => {
  if (!dateString || dateString === "0000-00-00") {
    return "Fecha no disponible";
  }

  const d = new Date(dateString);

  if (isNaN(d.getTime())) {
    return "Fecha inválida";
  }

  const year = d.getUTCFullYear();
  const month = new Intl.DateTimeFormat("es-ES", { month: "long", timeZone: "UTC" }).format(d);
  const day = d.getUTCDate();

  return `${day} ${month}, ${year}`;
};
export function daysLeft(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expirationDate = new Date(dateString);
  expirationDate.setHours(0, 0, 0, 0);
  const diffInMs = expirationDate.getTime() - today.getTime();

  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

  return diffInDays;
}
export const insertPeriodEveryThreeDigits = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export function formatMoney(
  amount: string | number | undefined | null,
  hideCurrencySymbol?: boolean,
  countryCode?: CountryCode
): string {
  if (!amount) {
    return "";
  }
  const { currency, id } = countryFormater(countryCode);
  const number = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatter = new Intl.NumberFormat(id, {
    style: "currency",
    currency,
    minimumFractionDigits: 0
  });

  if (hideCurrencySymbol) {
    return formatter.format(number).replace(/[^\d.,]/g, "");
  }

  return formatter.format(number);
}

const countryFormater = (currency: CountryCode = "co") => {
  return intFormat[currency];
};

const intFormat = {
  en: { currency: "USD", id: "en-US" },
  eur: { currency: "EUR", id: "en-DE" },
  jpn: { currency: "JPY", id: "ja-JP" },
  ch: { currency: "CNY", id: "zh-CN" },
  kr: { currency: "KRW", id: "ko-KR" },
  es: { currency: "EUR", id: "es-ES" },
  co: { currency: "COP", id: "es-CO" }
};

export const getCityName = (id: number) => {
  const city = locations.find((location) => location.id === id);
  return city?.city;
};

const locations = [
  {
    id: 1,
    city: "Bogotá"
  },
  {
    id: 246,
    city: "Medellin"
  },
  {
    id: 247,
    city: "Cali"
  },
  {
    id: 248,
    city: "Pereira"
  },
  {
    id: 249,
    city: "Barranquilla"
  }
];

export const isNonEmptyObject = (obj: {}) => {
  return !(Object.keys(obj).length === 0 && obj.constructor === Object);
};

export const stringToBoolean = (value: string | boolean | undefined): boolean => {
  if (value === undefined) {
    return false;
  }
  return value === "true" || value === true;
};

export const timeAgo = (date: string): string => {
  const currentDate = new Date();
  const dateToCompare = new Date(date);
  const diffInMs = currentDate.getTime() - dateToCompare.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minutos`;
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} horas`;
  } else if (diffInDays < 7) {
    return `Hace ${diffInDays} días`;
  } else if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks} semanas`;
  } else {
    return `Hace ${diffInMonths} meses`;
  }
};

export const formatDateAndTime = (date: string): string => {
  const d = new Date(date);
  const day = `0${d.getDate()}`.slice(-2);
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const year = d.getFullYear();
  const hours = `0${d.getHours()}`.slice(-2);
  const minutes = `0${d.getMinutes()}`.slice(-2);
  const period = d.getHours() >= 12 ? "PM" : "AM";

  return `${day}/${month}/${year} - ${hours}:${minutes} ${period}`;
};

export const formatMillionNumber = (number: number | undefined | null): string => {
  if (!number) {
    return "0";
  }

  const formatNumber = number / 1000000;

  if (formatNumber > 1000000) {
    return formatNumber.toFixed(2);
  }
  return formatNumber.toFixed();
};

export const formatCurrencyMoney = (value: number): string => {
  if (typeof value !== "number") {
    return "$0,00";
  }
  const [intPart] = value.toFixed(2).split(".");
  const formattedIntPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${formattedIntPart}`;
};

export const stringFromArrayOfSelect = (array: ISelectStringType[]): string => {
  return array.map((item) => item.value).join(", ");
};

export const formatDateDMY = (dateString: string): string => {
  const date = dayjs(dateString);
  return date.format("DD/MM/YYYY");
};

export const checkUserViewPermissions = (
  selectedProject: ISelectedProject | undefined,
  view?: string
): boolean => {
  if (!selectedProject) return false;
  if (selectedProject.isSuperAdmin) {
    return true;
  }

  const viewPermissions = selectedProject.views_permissions;
  if (!viewPermissions) {
    return false;
  }

  return viewPermissions.some((permission) => permission.page_name === view);
};

export function capitalize(str: string): string {
  if (typeof str !== "string" || str.length === 0) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const calculateDaysDifference = (startDate: Date, endDate: Date) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const differenceInTime = end.getTime() - start.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
};
