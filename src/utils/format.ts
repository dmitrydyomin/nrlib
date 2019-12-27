export const pad = (template: string, str: string | number, padLeft = true) => {
  if (typeof str === 'undefined') {
    return template;
  }
  if (padLeft) {
    return (template + str).slice(-template.length);
  }
  return (str + template).substring(0, template.length);
};

export const dateStr = (date: Date) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${pad('00', d)}.${pad('00', m)}.${pad('0000', y)}`;
};

export const dateStrISO = (date: Date) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${pad('0000', y)}-${pad('00', m)}-${pad('00', d)}`;
};

export const timeStr = (date: Date) => {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  return `${pad('00', h)}:${pad('00', m)}:${pad('00', s)}`;
};

export const dateTimeStr = (date: Date) => `${dateStr(date)} ${timeStr(date)}`;

export const shortName = (fullName: string) => {
  const p = `${fullName.trim()}  `.split(' ');
  const last = p[0];
  const first = p[1];
  const middle = p[2];
  let name = last;
  if (first) {
    name += ` ${first.substr(0, 1)}.`;
    if (middle) {
      name += ` ${middle.substr(0, 1)}.`;
    }
  }
  return name;
};

export const parseBool = (v: string | null | undefined) => {
  switch (v) {
    case undefined:
    case null:
    case '0':
      return false;
    case '1':
    case 'on':
      return true;
    default:
      return v;
  }
};

export const normalizePhoneNumber = (v: string) => {
  const clean = v.replace(/[^\d+]+/g, '');
  if (clean.length === 10 && clean[0] === '9') {
    return `+7${clean}`;
  }
  switch (clean.substr(0, 2)) {
    case '79':
      return `+${clean}`;
    case '89':
      return `+7${clean.substr(1)}`;
    case '37':
    case '38':
      return `+3${clean.substr(1)}`;
    default:
      return clean;
  }
};

export const getAge = (d: Date, refDate: Date | null) => {
  const birthDate = d instanceof Date ? d : new Date(d);
  const today = refDate || new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};
